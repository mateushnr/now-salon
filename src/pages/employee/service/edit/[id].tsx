import { recoverCustomerAuthData, recoverEmployeeAuthData } from '@/contexts/AuthContext';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import Head from 'next/head';

import styles from '@/styles/pages/Service.module.css'
import { EmployeeHeader } from '@/components/EmployeeHeader';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput } from '@/components/form/TextInput';
import { SelectInput } from '@/components/form/SelectInput';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Textarea } from '@/components/form/Textarea';
import Link from 'next/link';
import { Service } from '@/@types/service';

const ServiceSchema = z.object({
    name: z
        .string()
        .min(1, 'Informe o nome do serviço'),
    description: z
        .string()
        .min(1, 'Informe a descrição do serviço'),
    estimatedTime: z
        .string()
        .min(1, 'Informe a duração estimada do serviço!'),
    price: z.coerce.number().min(6, 'O preço deve ser maior que 5'),
    status: z
        .string()
  })

export type ServiceFormData = z.infer<typeof ServiceSchema>

interface ServiceProps {
    employeeAccessLevel: string
    serviceDataToEdit: Service
}

export default function EditService({employeeAccessLevel, serviceDataToEdit}: ServiceProps) {
    const { register, handleSubmit, formState, setValue, getValues } =
    useForm<ServiceFormData>({
      mode: 'onBlur',
      resolver: zodResolver(ServiceSchema),
    })

    useEffect(()=>{
        if(serviceDataToEdit !== null){
            setValue('name', serviceDataToEdit.name)
            setValue('description', serviceDataToEdit.description)
            setValue('estimatedTime', serviceDataToEdit.estimatedTime)
            setValue('price', serviceDataToEdit.price)
            setValue('status', serviceDataToEdit.status)
        }
    },[setValue, serviceDataToEdit])

    const router = useRouter()

    async function handleEditService(data: ServiceFormData){
        try {
            const response = await fetch(`http://localhost:8080/api-now-salon/services/api/?id=${router.query.id}`, {
              method: 'PUT', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data), 
            });

            switch (response.status){
                case 200:{
                    setTimeout(()=>{
                        router.push(`/employee/service`)
                    }, 1000)
                    break
                }
                default: {
                    alert("Erro na edição de serviço")
                }
            }
          } catch (error) {
            alert("Erro na edição de serviço: " + error)
          }
    }

    return (
        <>
        <Head>
            <title>Editar serviço</title>
        </Head>
        <EmployeeHeader employeeAccessLevel={employeeAccessLevel}/>
        <main className={styles.container}>
            <header className={styles.headerService}>
                <h1 className={styles.pageTitle}>Editando serviço</h1>
                <Link href="/employee/service" className={styles.deleteButton}>Cancelar</Link>
            </header>
        
            <span className={styles.separatorDetail}/>

            {serviceDataToEdit !== null ? (
            <form onSubmit={handleSubmit(handleEditService)} id="createService" className={styles.formContainer}>
                <section className={styles.sectionData}>
                    <strong>Dados do serviço</strong>
                    
                    <div className={styles.fieldsData}>
                        <TextInput
                            type="text"
                            field="Nome"
                            {...register('name')}
                            error={formState.errors.name}
                            hasInfo={false}
                        />
                        <Textarea
                            field="Descrição"
                            {...register('description')}
                            error={formState.errors.description}
                        />
                        <TextInput
                            type="time"
                            field="Tempo estimado"
                            {...register('estimatedTime')}
                            error={formState.errors.estimatedTime}
                            hasInfo={false}
                        /> 
                        <TextInput
                            type="number"
                            field="Preço"
                            {...register('price')}
                            step="0.1"
                            error={formState.errors.price}
                            hasInfo={false}
                        /> 
                        <SelectInput
                            field="Status do serviço"
                            options={[
                                {
                                    value: "Ativo", 
                                    option: "Ativo"
                                }, 
                                {   
                                    value: "Desativado", 
                                    option: "Desativado"
                                }
                            ]}
                            {...register('status')}
                            defaultValue={getValues('status')}
                            error={formState.errors.status}
                            hasPlaceholder={false}
                        /> 
                    </div>

                    <button className={styles.listServiceButton} type="submit">Confirmar e editar serviço</button>
                </section>
            </form> ): (
                <strong className={styles.itemNotFoundTitle}>Serviço não encontrado</strong>
            )}
        </main>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const {'nowsalon.customer-token': tokenCustomer, 'nowsalon.employee-token': tokenEmployee} = parseCookies(context)

    const customer = await recoverCustomerAuthData(tokenCustomer)
    const employee = await recoverEmployeeAuthData(tokenEmployee)

    const routeParams = context.params;

    let serviceDataToEdit = null

    if(routeParams !== undefined){
        try {
            const response = await fetch(`http://localhost:8080/api-now-salon/services/api/?id=${routeParams.id}`, {
            });
        
            if (response.ok) {
                serviceDataToEdit = await response.json();
            }else{
              throw new Error('Falha em recuperar dados do serviço em edição');
            }
        } catch (error) {
            console.error('Falha em recuperar dados do serviço em edição: ', error);
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
                serviceDataToEdit,
            }
        }
    }
}
