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
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { handlePhoneChange } from '@/formatters/phone';
import { Service } from '@/@types/service';
import { Employee } from '@/@types/employee';
import { EmployeeJobs } from '@/@types/employeeJobs';

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
        .union([z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'), z.string().length(0)]).optional(),
    jobs: z.array(z.number()).optional()
  })

export type EmployeeFormData = z.infer<typeof EmployeeSchema>

interface EmployeeEditProps {
    employeeAccessLevel: string
    servicesData: Service[]
    employeeDataToEdit: Employee
    employeeJobsDataToEdit: EmployeeJobs[]
}

export default function EditEmployee({employeeAccessLevel, servicesData, employeeDataToEdit, employeeJobsDataToEdit}: EmployeeEditProps) {
    const { register, handleSubmit, formState, setValue } =
    useForm<EmployeeFormData>({
      mode: 'onBlur',
      resolver: zodResolver(EmployeeSchema),
    })

    const router = useRouter()

    useEffect(()=>{
        if(employeeDataToEdit !== null){
            setValue('name', employeeDataToEdit.name)
            setValue('phone', employeeDataToEdit.phone)
            setValue('role', employeeDataToEdit.role)
            setValue('accessLevel', employeeDataToEdit.accessLevel)
        }
    }, [setValue, employeeDataToEdit])

    const alreadyRegisteredJobs = employeeJobsDataToEdit.map((job =>{
        return job.idService
    }))

    async function handleEditEmployee(data: EmployeeFormData){
        const selectedJobsToEdit = servicesData.filter(service => {
            const checkbox = document.getElementById(service.id.toString()) as HTMLInputElement;
            return checkbox.checked;
        }).map(service => service.id);

        const jobsToDelete = alreadyRegisteredJobs.filter((idJobRegistered)=>{
            return !selectedJobsToEdit.includes(idJobRegistered)
        })

        const jobsToAdd = selectedJobsToEdit.filter((idJobSelected)=>{
            return !alreadyRegisteredJobs.includes(idJobSelected)
        })

        if (!data.password) {
            delete data.password;
        }

        try {
            const response = await fetch(`http://localhost:8080/api-now-salon/employees/api/?id=${router.query.id}`, {
              method: 'PUT', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data), 
            });

            switch (response.status){
                case 200:{
                    setTimeout(()=>{
                        router.push(`/employee/employee`)
                    }, 1000)
                    break

                }
                default: {
                    alert("Erro na edição de funcionário")
                }
            }
        } catch (error) {
            alert("Erro na edição de funcionário: " + error)
        }
        
        if(jobsToAdd.length > 0){
            const formattedJobsToAdd = jobsToAdd.map(idJob => {
                return {idService: idJob, idEmployee: router.query.id}
            })

            try {
                const response = await fetch(`http://localhost:8080/api-now-salon/employeeJobs/api`, {
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(formattedJobsToAdd), 
                });
    
                switch (response.status){
                    case 201:{
                        break
                    }
                    default: {
                        alert("Erro na inserção dos novos serviços do funcionário em edição")
                    }
                }
            } catch (error) {
                alert("Erro na inserção dos novos serviços do funcionário em edição: " + error)
            }
        }

        if(jobsToDelete.length > 0){
            const formattedJobsToDelete = jobsToDelete.map(idJob => {
                return {idService: idJob, idEmployee: router.query.id}
            })

            try {
                const response = await fetch(`http://localhost:8080/api-now-salon/employeeJobs/api`, {
                  method: 'DELETE', 
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(formattedJobsToDelete), 
                });
    
                switch (response.status){
                    case 200:{
                        break
                    }
                    default: {
                        alert("Erro ao excluir os serviços do funcionário em edição")
                    }
                }
            } catch (error) {
                alert("Erro ao excluir os serviços do funcionário em edição: " + error)
            }
        }
    }

    return (
        <>
        <Head>
            <title>Editar funcionário</title>
        </Head>
        <EmployeeHeader employeeAccessLevel={employeeAccessLevel}/>
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Editando funcionário</h1>
                <Link href="/employee/employee" className={styles.deleteButton}>Cancelar</Link>
            </header>
            
            <span className={styles.separatorDetail}/>
       
            {employeeDataToEdit !== null ? (
                <form onSubmit={handleSubmit(handleEditEmployee)} className={styles.formContainer}>
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
                                    options={["Funcionario", "Admin"]}
                                    {...register('accessLevel')}
                                    error={formState.errors.accessLevel}
                                /> 
                                <TextInput
                                    type="password"
                                    field="Senha"
                                    {...register('password')}
                                    error={formState.errors.password}
                                    hasInfo={true}
                                    infoMessage="Deixar a senha em branco mantém a senha atual"
                                /> 
                            </div>
                        </section>
                        <section className={styles.sectionEmployeeServices}>
                            <strong>Serviços realizados</strong>
                            <div className={styles.containerCheckList}>
                                {servicesData.map((service)=>{
                                    const isRegistered = alreadyRegisteredJobs.some(jobId => jobId === service.id)
                                    
                                    return (
                                    <div key={service.id}>
                                        <input id={service.id.toString()} value={service.id} defaultChecked={isRegistered}name={service.name}type="checkbox"/>
                                        <label htmlFor={service.id.toString()}>{service.name}</label>
                                    </div>
                                    )
                                })}
                            </div>
                        </section>
                    </div>

                    <button className={styles.listButton} type="submit">Confirmar e editar funcionário</button>
                </form>  
            ): (
                <strong className={styles.itemNotFoundTitle}>Funcionário não encontrado</strong>
            )}
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

    const routeParams = context.params;

    let employeeDataToEdit = null
    let employeeJobsDataToEdit = null

    if(routeParams !== undefined){
        try {
            const response = await fetch(`http://localhost:8080/api-now-salon/employees/api/?id=${routeParams.id}`, {
            });
        
            if (response.ok) {
                employeeDataToEdit = await response.json();
            }else{
              throw new Error('Falha em recuperar dados do funcionário em edição');
            }
        } catch (error) {
            console.error('Falha em recuperar dados do funcionário em edição: ', error);
        }

        try {
            const response = await fetch(`http://localhost:8080/api-now-salon/employeeJobs/api/jobsbyemployee/?idemployee=${routeParams.id}`, {
            });
        
            if (response.ok) {
                employeeJobsDataToEdit = await response.json();
            }else{
              throw new Error('Falha em recuperar dados dos serviços do funcionário em edição');
            }
        } catch (error) {
            console.error('Falha em recuperar dados dos serviços do funcionário em edição: ', error);
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
                employeeDataToEdit,
                employeeJobsDataToEdit,
            }
        }
    }
}
