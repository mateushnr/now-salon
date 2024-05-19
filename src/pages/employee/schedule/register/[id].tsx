import { recoverCustomerAuthData, recoverEmployeeAuthData } from '@/contexts/AuthContext';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import Head from 'next/head';

import styles from '@/styles/pages/Schedule.module.css'
import { EmployeeHeader } from '@/components/EmployeeHeader';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectInput } from '@/components/form/SelectInput';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Service } from '@/@types/service';
import { Employee } from '@/@types/employee';
import { TextInput } from '@/components/form/TextInput';
import { Textarea } from '@/components/form/Textarea';

const ScheduleSchema = z.object({
    idCustomer: z
        .coerce
        .number(),
    idEmployee: z
        .string()
        .refine(val => !isNaN(Number(val)), { message: "Selecione um funcionário!" })
        .transform(val => Number(val)),
    idService: z
        .string()
        .refine(val => !isNaN(Number(val)), { message: "Selecione um serviço!" })
        .transform(val => Number(val)),
    dateSchedule: z
        .string()
        .min(1, 'Informe a data de agendamento!'),
    hourSchedule: z
        .string()
        .min(1, 'Informe o horário de agendamento!'),
    status: z
        .string(),
    observation: z
        .string()
        .optional(),
    reasonCancellation: z
        .string()
        .optional(),
    whoCancelled: z
        .string()
        .optional()
  })

export type ScheduleFormData = z.infer<typeof ScheduleSchema>

interface ScheduleProps {
    employeeAccessLevel: string
    servicesData: Service[]
    employeesData: Employee[]
    customerSelectedName: string
}

export default function CreateSchedule({employeeAccessLevel, servicesData, employeesData, customerSelectedName}: ScheduleProps) {
    const { register, handleSubmit, formState, setValue, getValues } =
    useForm<ScheduleFormData>({
      mode: 'onBlur',
      resolver: zodResolver(ScheduleSchema),
    })

    const [isSelectedStatusCancelled, setIsSelectedStatusCancelled] = useState<boolean>(false)

    const [successRegistration, setSuccessRegistration] = useState<boolean>(false)

    const router = useRouter()

    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value
        if (value === 'Cancelado') {
            setIsSelectedStatusCancelled(true)
        } else {
            setIsSelectedStatusCancelled(false)
        }
    }

    async function handleCreateSchedule(data: ScheduleFormData){
        if(data.status !== 'Cancelado'){
            delete data.reasonCancellation
            delete data.whoCancelled
        }

        if(!data.observation){
            delete data.observation
        }

        try {
            const response = await fetch('http://localhost:8080/api-now-salon/schedules/api', {
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data), 
            });

            switch (response.status){
                case 201:{
                    setTimeout(()=>{
                        router.reload()
                    }, 2000)

                    setSuccessRegistration(true)
                    break
                }
                default: {
                    alert("Erro no cadastro de agendamento")
                }
            }
        } catch (error) {
        alert("Erro no cadastro de agendamento: " + error)
        }
    }

    return (
        <>
        <Head>
            <title>Incluir agendamento</title>
        </Head>
        <EmployeeHeader employeeAccessLevel={employeeAccessLevel}/>
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Incluir novo agendamento</h1>
                <Link href="/employee/schedule/selectcustomer" className={styles.listButton}>Selecionar outro cliente</Link>
            </header>
            
            <span className={styles.separatorDetail}/>
       
            <div className={styles.customerSelected}>
                <label>Cliente:</label>
                <strong>{customerSelectedName}</strong>
            </div>

            <form onSubmit={handleSubmit(handleCreateSchedule)} className={styles.formContainer}>
                <div className={styles.formData}>
                    <section className={styles.sectionData}>
                        <div className={styles.fieldsData}>
                            <input 
                                type="hidden" 
                                value={router.query.id} 
                                {...register('idCustomer')}
                            />
                            <SelectInput
                                field="Funcionário"
                                options={employeesData.map((employee)=>{
                                    return {
                                        value: employee.registration.toString(),
                                        option: employee.name
                                    }
                                })}
                                {...register('idEmployee')}
                                error={formState.errors.idEmployee}
                                hasPlaceholder={true}
                                placeholderMessage='--- Selecione um funcionário ---'
                            />
                            <SelectInput
                                field="Serviço"
                                options={servicesData.map((service)=>{
                                    return {
                                        value: service.id.toString(),
                                        option: service.name
                                    }
                                })}
                                {...register('idService')}
                                error={formState.errors.idService}
                                hasPlaceholder={true}
                                placeholderMessage='--- Selecione um serviço ---'
                            /> 
                            <TextInput
                                type="date"
                                field="Data do agendamento"
                                {...register('dateSchedule')}
                                error={formState.errors.dateSchedule}
                                hasInfo={false}
                            /> 
                            <TextInput
                                type="time"
                                field="Horário do agendamento"
                                {...register('hourSchedule')}
                                error={formState.errors.hourSchedule}
                                hasInfo={false}
                            /> 
                            <Textarea
                                field="Observação"
                                {...register('observation')}
                            />
                        </div>
                    </section>
                    <section className={styles.sectionStatusSchedule}>
                        <SelectInput
                            field="Status"
                            options={[
                                {
                                    value: 'Pendente',
                                    option: 'Pendente'
                                },
                                {
                                    value: 'Finalizado',
                                    option: 'Finalizado'
                                },
                                {
                                    value: 'Cancelado',
                                    option: 'Cancelado'
                                }
                            ]}
                            {...register('status')}
                            error={formState.errors.status}
                            hasPlaceholder={false}
                            onChangeHandler={handleStatusChange}
                        /> 
                        
                        {isSelectedStatusCancelled ? (
                            <>
                                <Textarea
                                    field="Motivo cancelamento"
                                    {...register('reasonCancellation')}
                                />
                                <SelectInput
                                    field="Quem cancelou"
                                    options={[
                                        {
                                            value: 'Funcionario',
                                            option: 'Funcionario'
                                        },
                                        {
                                            value: 'Cliente',
                                            option: 'Cliente'
                                        }
                                    ]}
                                    {...register('whoCancelled')}
                                    error={formState.errors.whoCancelled}
                                    hasPlaceholder={false}
                                /> 
                            </>
                           
                        ): null}
                    </section>
                </div>

                <button className={styles.createButton} type="submit">Cadastrar agendamento</button>

                {successRegistration 
                ? (
                    <span className={styles.successMessage}>Cadastrado com sucesso!</span>
                ) 
                : null}
            </form>  
        </main>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const {'nowsalon.customer-token': tokenCustomer, 'nowsalon.employee-token': tokenEmployee} = parseCookies(context)

    const customer = await recoverCustomerAuthData(tokenCustomer)
    const employee = await recoverEmployeeAuthData(tokenEmployee)

    let servicesData = null
    let employeesData = null
    let customerSelectedName = null

    const routeParams = context.params;

    try {
        const response = await fetch('http://localhost:8080/api-now-salon/services/api', {
        });
    
        if (response.ok) {
            servicesData = await response.json();
        }else{
          throw new Error('Falha em recuperar dados de serviços');
        }
    } catch (error) {
        console.error('Falha em recuperar dados de serviços: ', error);
    }

    try {
        const response = await fetch('http://localhost:8080/api-now-salon/employees/api', {
        });
    
        if (response.ok) {
            employeesData = await response.json();
        }else{
          throw new Error('Falha em recuperar dados de funcionarios');
        }
    } catch (error) {
        console.error('Falha em recuperar dados de funcionarios: ', error);
    }

    if(routeParams != undefined){
        try {
            const response = await fetch(`http://localhost:8080/api-now-salon/customers/api/?id=${routeParams.id}`, {
            });
        
            if (response.ok) {
                const customerSelected = await response.json()

                customerSelectedName = customerSelected.name
            }else{
              throw new Error('Falha em recuperar dados do cliente selecionado');
            }
        } catch (error) {
            console.error('Falha em recuperar dados do cliente selecionado: ', error);
        }
    }

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
                servicesData,
                employeesData,
                customerSelectedName,
            }
        }
    }
}
