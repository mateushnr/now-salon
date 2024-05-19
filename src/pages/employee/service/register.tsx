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
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Textarea } from '@/components/form/Textarea';
import Link from 'next/link';

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
}

export default function CreateService({employeeAccessLevel}: ServiceProps) {
    const { register, handleSubmit, formState, setValue, getValues } =
    useForm<ServiceFormData>({
      mode: 'onBlur',
      resolver: zodResolver(ServiceSchema),
    })

    const [successRegistration, setSuccessRegistration] = useState<boolean>(false)

    const router = useRouter()

    async function handleCreateService(data: ServiceFormData){
        try {
            const response = await fetch('http://localhost:8080/api-now-salon/services/api', {
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
                    alert("Erro no cadastro de serviço")
                }
            }
          } catch (error) {
            alert("Erro no cadastro de serviço: " + error)
          }
    }

    return (
        <>
        <Head>
            <title>Gerenciar serviços</title>
        </Head>
        <EmployeeHeader employeeAccessLevel={employeeAccessLevel}/>
        <main className={styles.container}>
            <header className={styles.headerService}>
                <h1 className={styles.pageTitle}>Criar novo serviço</h1>
                <Link href="/employee/service" className={styles.listServiceButton}>Visualizar serviços</Link>
            </header>
            
            <span className={styles.separatorDetail}/>
       
            <form onSubmit={handleSubmit(handleCreateService)} id="createService" className={styles.formContainer}>
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
                            options={["Ativo", "Desativado"]}
                            {...register('status')}
                            defaultValue={getValues('status')}
                            error={formState.errors.status}
                        /> 
                    </div>

                    <button className={styles.createServiceButton} type="submit">Cadastrar serviço</button>

                    {successRegistration ? (<span className={styles.successMessage}>Cadastrado com sucesso!</span>) : null}
                </section>
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
