import { recoverCustomerAuthData, recoverEmployeeAuthData } from '@/contexts/AuthContext';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import Head from 'next/head';

import styles from '@/styles/pages/ManageEmploye.module.css'
import { EmployeeHeader } from '@/components/EmployeeHeader';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput } from '@/components/form/TextInput';
import { SelectInput } from '@/components/form/SelectInput';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { handlePhoneChange } from '@/formatters/phone';
import { Service } from '@/@types/service';

const EmployeeSchema = z.object({
    name: z
        .string()
        .min(1, 'Informe o nome'),
    phone: z
        .string()
        .min(1, 'Informe o seu telefone')
        .min(13, 'Telefone incompleto'),
    role: z
        .string()
        .min(1, 'Informe o cargo'),
    accessLevel: z
        .string(),
    password: z
        .string()
        .min(1, 'Informe a sua senha')
        .min(6, 'A senha deve ter no mínimo 6 caracteres'),
    jobs: z.array(z.number()).optional()
  })

export type EmployeeFormData = z.infer<typeof EmployeeSchema>

interface EmployeeProps {
    employeeAccessLevel: string
    servicesData: Service[]
}

export default function CreateEmployee({employeeAccessLevel, servicesData}: EmployeeProps) {
    const { register, handleSubmit, formState, setValue, getValues } =
    useForm<EmployeeFormData>({
      mode: 'onBlur',
      resolver: zodResolver(EmployeeSchema),
    })

    const [successRegistration, setSuccessRegistration] = useState<boolean>(false)

    const router = useRouter()

    async function handleCreateEmployee(data: EmployeeFormData){
        const selectedJobs = servicesData.filter(service => {
            const checkbox = document.getElementById(service.id.toString()) as HTMLInputElement;
            return checkbox.checked;
        }).map(service => service.id);

        try {
            const response = await fetch('http://localhost:8080/api-now-salon/employees/api', {
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data), 
            });

            switch (response.status){
                case 201:{
                    setTimeout(()=>{
                        router.reload()
                    }, 2000)

                    const employeeCreated = await response.json()
                    const idEmployeeCreated = employeeCreated.registration

                    if(selectedJobs.length != 0){
                        const formattedSelectedJobs =  selectedJobs.map((job) =>{
                            return {idService: job, idEmployee: idEmployeeCreated}
                        })

                        try {
                            const response = await fetch('http://localhost:8080/api-now-salon/employeeJobs/api', {
                              method: 'POST', 
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(formattedSelectedJobs), 
                            });
                
                            switch (response.status){
                                case 201:{
                                    break
                                }
                                default: {
                                    alert("Erro no cadastro de serviços do funcionário")
                                }
                            }
                        } catch (error) {
                            alert("Erro no cadastro de serviços do funcionário: " + error)
                        }
                    }

                    setSuccessRegistration(true)
                    break
                }
                default: {
                    alert("Erro no cadastro de funcionário")
                }
            }
        } catch (error) {
        alert("Erro no cadastro de funcionário: " + error)
        }
    }

    return (
        <>
        <Head>
            <title>Gerenciar funcionários</title>
        </Head>
        <EmployeeHeader employeeAccessLevel={employeeAccessLevel}/>
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Criar novo funcionário</h1>
                <Link href="/employee/employee" className={styles.listButton}>Visualizar funcionários</Link>
            </header>
            
            <span className={styles.separatorDetail}/>
       
            <form onSubmit={handleSubmit(handleCreateEmployee)} className={styles.formContainer}>
                <div className={styles.formData}>
                    <section className={styles.sectionData}>
                        <strong>Dados do funcionário</strong>
                        
                        <div className={styles.fieldsData}>
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
                                field="Cargo"
                                {...register('role')}
                                error={formState.errors.role}
                                hasInfo={false}
                            />
                            <SelectInput
                                field="Status do serviço"
                                options={[
                                    {
                                        value: "Funcionario", 
                                        option: "Funcionario"
                                    }, 
                                    {   
                                        value: "Admin", 
                                        option: "Admin"
                                    }
                                ]}
                                {...register('accessLevel')}
                                error={formState.errors.accessLevel}
                                hasPlaceholder={false}
                            /> 
                            <TextInput
                                type="password"
                                field="Senha"
                                {...register('password')}
                                error={formState.errors.password}
                                hasInfo={false}
                            /> 
                        </div>
                    </section>
                    <section className={styles.sectionEmployeeServices}>
                        <strong>Serviços realizados</strong>
                        <div className={styles.containerCheckList}>
                            {servicesData.map((service)=>{
                                return (
                                <div key={service.id}>
                                    <input id={service.id.toString()} value={service.id} name={service.name}type="checkbox"/>
                                    <label htmlFor={service.id.toString()}>{service.name}</label>
                                </div>
                                )
                            })}
                        </div>
                    </section>
                </div>

                <button className={styles.createButton} type="submit">Cadastrar funcionário</button>

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
            }
        }
    }
}
