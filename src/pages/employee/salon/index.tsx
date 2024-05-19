import { recoverCustomerAuthData, recoverEmployeeAuthData } from '@/contexts/AuthContext';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import Head from 'next/head';

import styles from '@/styles/pages/Salon.module.css'
import { EmployeeHeader } from '@/components/EmployeeHeader';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput } from '@/components/form/TextInput';
import { handlePhoneChange } from '@/formatters/phone';
import { SelectInput } from '@/components/form/SelectInput';
import { ChangeEvent, InputHTMLAttributes, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const EditSalonSchema = z.object({
    name: z
        .string()
        .min(1, 'Informe o nome do estabelecimento'),
    phone: z
        .string()
        .min(1, 'Informe o telefone de contato')
        .min(13, 'Telefone incompleto'),
    daysWeekOpen: z
    .string(),
    timeOpen: z
        .string()
        .min(1, 'Informe a hora de abertura'),
    timeClose: z
        .string()
        .min(1, 'Informe a hora de fechamento'),
    emailContact: z
        .string()
        .min(1, 'Informe o email de contato')
        .refine((value) => {  
                    const regex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/
                    return regex.test(value)
                }, 'Email inválido'),
    status: z
        .string(),
    address: z
        .string()
        .min(1, 'Informe a rua e o número do salão'),
    neighborhood: z
        .string()
        .min(1, 'Informe o bairro do salão'),
    cityState: z
        .string()
        .min(1, 'Informe a cidade e estado do estabelecimento')
  })

export type EditSalonFormData = z.infer<typeof EditSalonSchema>

interface SalonProps {
    employeeAccessLevel: string
}

export default function Salon({employeeAccessLevel}: SalonProps) {
    const { register, handleSubmit, formState, setValue, getValues } =
    useForm<EditSalonFormData>({
      mode: 'onBlur',
      resolver: zodResolver(EditSalonSchema),
    })

    const router = useRouter()

    const loadCheckedData = useCallback(() => {
        const initialDays = getValues('daysWeekOpen') || '';

        const initialDaysArray = initialDays.split(', ');

        const checkboxElements: NodeListOf<HTMLInputElement> = document.querySelectorAll('input[type="checkbox"]');

        checkboxElements.forEach((checkbox) => {
            checkbox.checked = initialDaysArray.includes(checkbox.value);
        });
    }, [getValues])

    useEffect(() => {
        const fetchDataSalon = async () => {
            const response = await fetch('http://localhost:8080/api-now-salon/salons/api/?id=1')

            const jsonSalonData: EditSalonFormData = await response.json()

            setValue('name', jsonSalonData.name);
            setValue('phone', jsonSalonData.phone);
            setValue('daysWeekOpen', jsonSalonData.daysWeekOpen);
            loadCheckedData()

            setValue('timeOpen', jsonSalonData.timeOpen);
            setValue('timeClose', jsonSalonData.timeClose);
            setValue('emailContact', jsonSalonData.emailContact);
            setValue('status', jsonSalonData.status);
            setValue('address', jsonSalonData.address);
            setValue('neighborhood', jsonSalonData.neighborhood);
            setValue('cityState', jsonSalonData.cityState);
        }

        fetchDataSalon().catch(console.error)
    }, [loadCheckedData, setValue])

    async function handleEditSalon(data: EditSalonFormData){
        try {
            const response = await fetch('http://localhost:8080/api-now-salon/salons/api/?id=1', {
              method: 'PUT', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data), 
            });

            switch (response.status){
                case 200:{
                    router.reload()
                    break
                }
                default: {
                    alert("Erro na alteração dos dados do estabelecimento")
                }
            }
          } catch (error) {
            alert("Erro na alteração dos dados do estabelecimento: " + error)
          }
    }

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { checked, value } = event.target;
        
        const currentDaysString = getValues('daysWeekOpen') || 'empty';
      
        const currentDaysArray = currentDaysString == 'empty' ? 
        [] : currentDaysString.split(', ') ;
      
        const updatedDaysString = checked
          ? [...currentDaysArray, value].join(', ')
          : currentDaysArray.filter((day) => day !== value).join(', ');

        setValue('daysWeekOpen', updatedDaysString);
    };

    return (
        <>
        <Head>
            <title>Gerenciar estabelecimento</title>
        </Head>
        <EmployeeHeader employeeAccessLevel={employeeAccessLevel}/>
        <main className={styles.container}>
            <h1 className={styles.pageTitle}>Gerenciar Estabelecimento</h1>
            <span className={styles.separatorDetail}/>
       
            <form onSubmit={handleSubmit(handleEditSalon)} id="editsalon" className={styles.formContainer}>
                <div className={styles.formData}>
                    <section className={styles.sectionSalonData}>
                        <strong>Dados do Estabelecimento</strong>
                        
                        <div className={styles.fieldsSalonData}>
                            <TextInput
                                type="text"
                                field="Nome"
                                {...register('name')}
                                error={formState.errors.name}
                                hasInfo={false}
                            />
                            <TextInput
                                type="tel"
                                field="Telefone"
                                maxLength={13}
                                {...register('phone', {onChange: handlePhoneChange})}
                                error={formState.errors.phone}
                                hasInfo={false}
                            />
                            <TextInput
                                type="text"
                                field="Email Contato"
                                {...register('emailContact')}
                                error={formState.errors.emailContact}
                                hasInfo={false}
                            /> 
                            <SelectInput
                                field="Status do Salão"
                                options={["Ativo", "Reformando", "Inativo"]}
                                {...register('status')}
                                defaultValue={getValues('status')}
                                error={formState.errors.status}
                            /> 
                            <TextInput
                                type="text"
                                field="Endereço"
                                {...register('address')}
                                error={formState.errors.address}
                                hasInfo={false}
                            /> 
                            <TextInput
                                type="text"
                                field="Bairro"
                                {...register('neighborhood')}
                                error={formState.errors.neighborhood}
                                hasInfo={false}
                            /> 
                            <TextInput
                                type="text"
                                field="Cidade/Estado"
                                {...register('cityState')}
                                error={formState.errors.cityState}
                                hasInfo={false}
                            /> 
                        </div>
                    </section>
                    <section className={styles.sectionSalonOperation}>
                        <strong>Funcionamento</strong>
                        
                        <div className={styles.fieldsSalonOperation}>
                            <TextInput
                                type="time"
                                field="Horário de Abertura"
                                {...register('timeOpen')}
                                error={formState.errors.timeOpen}
                                hasInfo={false}
                            /> 
                            <TextInput
                                type="time"
                                field="Horário de Fechamento"
                                {...register('timeClose')}
                                error={formState.errors.timeClose}
                                hasInfo={false}
                            />

                            <div className={styles.containerCheckList}>
                                <label className={styles.labelTitleChecklist}>Dias de Funcionamento</label>

                                <div>
                                    <input id="Domingo" onChange={handleCheckboxChange} value="Domingo" type="checkbox" />
                                    <label htmlFor="Domingo" >Domingo</label>
                                </div>
                                <div>
                                    <input id="Segunda" onChange={handleCheckboxChange} value="Segunda" type="checkbox" />
                                    <label htmlFor="Segunda">Segunda</label>
                                </div>
                                <div>
                                    <input id="Terca" onChange={handleCheckboxChange} value="Terca" type="checkbox" />
                                    <label htmlFor="Terca">Terça</label>
                                </div>
                                <div>
                                    <input id="Quarta" onChange={handleCheckboxChange} value="Quarta" type="checkbox" />
                                    <label htmlFor="Quarta">Quarta</label>
                                </div>
                                <div>
                                    <input id="Quinta" onChange={handleCheckboxChange} value="Quinta" type="checkbox" />
                                    <label htmlFor="Quinta">Quinta</label>
                                </div>
                                <div>
                                    <input id="Sexta" onChange={handleCheckboxChange} value="Sexta" type="checkbox" />
                                    <label htmlFor="Sexta">Sexta</label>
                                </div>
                                <div>
                                    <input id="Sabado" onChange={handleCheckboxChange} value="Sabado" type="checkbox" />
                                    <label htmlFor="Sabado">Sabado</label>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <button className={styles.saveEditButton} type="submit"> Salvar dados</button>
            </form>  
        </main>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const {'nowsalon.customer-token': tokenCustomer, 'nowsalon.employee-token': tokenEmployee} = parseCookies(context)

    const customer = await recoverCustomerAuthData(tokenCustomer)
    const employee = await recoverEmployeeAuthData(tokenEmployee)

    if(customer != null || employee == null || employee.accessLevel != "Admin"){
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }else {
        return {
            props: {
                employeeAccessLevel: employee.accessLevel,
            }
        }
    }
}
