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
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Service } from '@/@types/service';
import { Employee } from '@/@types/employee';
import { TextInput } from '@/components/form/TextInput';
import { Textarea } from '@/components/form/Textarea';
import { Schedule } from '@/@types/schedule';

const ScheduleSchema = z.object({
    idCustomer: z
        .coerce
        .number(),
    idEmployee: z
        .coerce
        .number(),
    idService: z
        .coerce
        .number(),
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
    scheduleDataToEdit: Schedule
}

export default function EditSchedule({employeeAccessLevel, servicesData, employeesData, scheduleDataToEdit}: ScheduleProps) {
    const { register, handleSubmit, formState, setValue } =
    useForm<ScheduleFormData>({
      mode: 'onBlur',
      resolver: zodResolver(ScheduleSchema),
    })

    const [isSelectedStatusCancelled, setIsSelectedStatusCancelled] = useState<boolean>(scheduleDataToEdit.status === 'Cancelado' ? true : false)

    const router = useRouter()

    useEffect(()=>{
        if(scheduleDataToEdit !== null){
            setValue('idCustomer', scheduleDataToEdit.idCustomer)
            setValue('idEmployee', scheduleDataToEdit.idEmployee)
            setValue('idService', scheduleDataToEdit.idService)
            setValue('dateSchedule', scheduleDataToEdit.dateSchedule)
            setValue('hourSchedule', scheduleDataToEdit.hourSchedule)
            setValue('status', scheduleDataToEdit.status)
            setValue('observation', scheduleDataToEdit.observation)
            if(scheduleDataToEdit.status === 'Cancelado'){
                setValue('reasonCancellation', scheduleDataToEdit.reasonCancellation)
                setValue('whoCancelled', scheduleDataToEdit.whoCancelled)
            }
        }
    }, [setValue, scheduleDataToEdit])

    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value
        if (value === 'Cancelado') {
            setIsSelectedStatusCancelled(true)
        } else {
            setIsSelectedStatusCancelled(false)
        }
    }

    async function handleEditSchedule(data: ScheduleFormData){
        if(data.status !== 'Cancelado'){
            data.reasonCancellation = undefined
            data.whoCancelled = undefined
        }

        try {
            const response = await fetch(`http://localhost:8080/api-now-salon/schedules/api/?id=${router.query.id}`, {
              method: 'PUT', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data), 
            });

            switch (response.status){
                case 200:{
                    setTimeout(()=>{
                        router.push(`/employee/schedule`)
                    }, 1000)

                    break
                }
                default: {
                    alert("Erro na edição do agendamento")
                }
            }
        } catch (error) {
        alert("Erro na edição do agendamento: " + error)
        }
    }

    return (
        <>
        <Head>
            <title>Editar agendamento</title>
        </Head>
        <EmployeeHeader employeeAccessLevel={employeeAccessLevel}/>
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Editando agendamento</h1>
                <Link href="/employee/schedule" className={styles.deleteButton}>Cancelar</Link>
            </header>
            
            <span className={styles.separatorDetail}/>

            {scheduleDataToEdit !== null ? (
            <>
                <div className={styles.customerSelected}>
                    <label>Cliente:</label>
                    <strong>{scheduleDataToEdit.customerName}</strong>
                </div>

                <form onSubmit={handleSubmit(handleEditSchedule)} className={styles.formContainer}>
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
                                            value: employee.registration,
                                            option: employee.name
                                        }
                                    })}
                                    {...register('idEmployee')}
                                    error={formState.errors.idEmployee}
                                    hasPlaceholder={false}
                                />
                                <SelectInput
                                    field="Serviço"
                                    options={servicesData.map((service)=>{
                                        return {
                                            value: service.id,
                                            option: service.name
                                        }
                                    })}
                                    {...register('idService')}
                                    error={formState.errors.idService}
                                    hasPlaceholder={false}
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

                    <button className={styles.listButton} type="submit">Confirmar e editar agendamento</button>
                </form>
            </>
            ): (
                <strong className={styles.itemNotFoundTitle}>Agendamento não encontrado</strong>
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
    let employeesData = null
    let scheduleDataToEdit = null

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
            const response = await fetch(`http://localhost:8080/api-now-salon/schedules/api/?id=${routeParams.id}`, {
            });
        
            if (response.ok) {
                scheduleDataToEdit = await response.json()

            }else{
              throw new Error('Falha em recuperar dados do agendamento a ser editado');
            }
        } catch (error) {
            console.error('Falha em recuperar dados do agendamento a ser editado: ', error);
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
                scheduleDataToEdit,
            }
        }
    }
}
