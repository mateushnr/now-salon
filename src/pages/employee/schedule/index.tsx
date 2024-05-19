import { recoverCustomerAuthData, recoverEmployeeAuthData } from '@/contexts/AuthContext';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import Head from 'next/head';

import styles from '@/styles/pages/Schedule.module.css'
import { EmployeeHeader } from '@/components/EmployeeHeader';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Filter } from '@/components/Filter';
import { ListTable } from '@/components/ListTable';
import { useRef, useState } from 'react';
import { Schedule } from '@/@types/schedule';

interface ListScheduleProps {
    employeeAccessLevel: string
    schedulesData: Schedule[]
}

export default function ListSchedule({employeeAccessLevel, schedulesData}: ListScheduleProps) {
    const router = useRouter()
    const actionFormRef = useRef<HTMLFormElement>(null);

    const [isItemSelected, setIsItemSelected] = useState(false)
    const [wasItemDeleted, setWasItemDeleted] = useState(false)
    const [filteredSchedulesData, setFilteredSchedulesData] = useState<Schedule[] | []>(schedulesData)

    const handleFilterScheduleList = (searchedValue: string, searchedOption: string) => {
        const filteredData = schedulesData.filter((schedule) => {
            switch (searchedOption) {
                case 'customer-name': {
                    return schedule.customerName.toLowerCase().includes(searchedValue.toLowerCase());
                }
                case 'employee-name': {
                    return schedule.employeeName.toLowerCase().includes(searchedValue.toLowerCase());
                }
                case 'service-name': {
                    return schedule.serviceName.toLowerCase().includes(searchedValue.toLowerCase());
                }
                case 'date-hour-schedule': {
                    const dateHourSchedule = schedule.dateSchedule + "-" + schedule.hourSchedule
                    return dateHourSchedule.includes(searchedValue.toLowerCase());
                }
                case 'status': {
                    return schedule.status.toLowerCase().includes(searchedValue.toLowerCase());
                }
                default: {
                    return true;
                }
            }
        })

        setFilteredSchedulesData(filteredData)
    }

    const handleClearFilterScheduleList = () => {
        setFilteredSchedulesData(schedulesData)
    }

    const handleSelectionChange = () => {
        setIsItemSelected(true);
    };

    const handleDeleteClick = async () => {
        const formAction = actionFormRef.current

        if(formAction !== null){
            const formData = new FormData(formAction);
            const idItemToDelete = formData.get('selectedId');

            try {
                const response = await fetch(`http://localhost:8080/api-now-salon/schedules/api/?id=${idItemToDelete}`, {
                    method: 'DELETE', 
                });
    
                switch (response.status){
                    case 200:{
                        setWasItemDeleted(true)

                        setTimeout(()=>{
                            router.reload()
                        }, 800)

                        break
                    }
                    default: {
                        alert("Erro ao deletar agendamento")
                    }
                }
            } catch (error) {
            alert("Erro ao deletar agendamento: " + error)
            }
        }
    };

    const handleEditClick = () => {
        const formAction = actionFormRef.current

        if(formAction !== null){
            const formData = new FormData(formAction);
            const idItemToEdit = formData.get('selectedId');

            router.push(`schedule/edit/${idItemToEdit}`)
        }
    };

    async function handleSubmitActionSchedule(event: React.FormEvent<HTMLFormElement>){
        event.preventDefault()
    }

    const formattedScheduleData = filteredSchedulesData.map(schedule=>{
        return [schedule.id.toString(), schedule.dateSchedule + "-" + schedule.hourSchedule, schedule.customerName, schedule.employeeName, schedule.serviceName, schedule.status]
    })

    return (
        <>
        <Head>
            <title>Gerenciar agendamentos</title>
        </Head>
        <EmployeeHeader employeeAccessLevel={employeeAccessLevel}/>
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Lista de agendamentos</h1>
                <Link href="/employee/schedule/selectcustomer" className={styles.createButton}>Cadastrar novo agendamento</Link>
            </header>
            
            <span className={styles.separatorDetail}/>

                <section>
                    <Filter filterOptions={[
                        {
                            value: 'customer-name',
                            label: 'Cliente'
                        }, 
                        {
                            value: 'employee-name',
                            label: 'Funcionário'
                        },
                        {
                            value: 'service-name',
                            label: 'Serviço'
                        },
                        {
                            value: 'date-hour-schedule',
                            label: 'Data/hora'
                        },
                        {
                            value: 'status',
                            label: 'Status'
                        },
                    ]} handleFilterList={handleFilterScheduleList} handleClearFilterList={handleClearFilterScheduleList}/>
                    <form ref={actionFormRef} onSubmit={handleSubmitActionSchedule} className={styles.listForm}>
                        <ListTable handleSelectionChange={handleSelectionChange}tableHeaders={['Data / Hora', 'Cliente', 'Funcionário', 'Serviço', 'Status']} tableData={formattedScheduleData}/>

                        {wasItemDeleted ? (<span className={styles.deletedItemMessage}>Agendamento deletado</span>) : null}
                        

                        <div className={styles.containerActionButtons}>
                            <button 
                                type="submit" 
                                onClick={handleEditClick}
                                disabled={!isItemSelected} 
                                className={styles.editButton}
                            >
                                Editar agendamento
                            </button>
                            <button 
                                type="submit" 
                                onClick={handleDeleteClick}
                                disabled={!isItemSelected} 
                                className={styles.deleteButton}
                            >
                                Excluir agendamento
                            </button>
                        </div>
                    </form>
                </section>
        </main>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const {'nowsalon.customer-token': tokenCustomer, 'nowsalon.employee-token': tokenEmployee} = parseCookies(context)

    const customer = await recoverCustomerAuthData(tokenCustomer)
    const employee = await recoverEmployeeAuthData(tokenEmployee)

    let schedulesData = []

    try {
        const response = await fetch('http://localhost:8080/api-now-salon/schedules/api', {
        });
    
        if (response.ok) {
            schedulesData = await response.json();
        }else{
          throw new Error('Falha em recuperar dados de agendamentos');
        }
    } catch (error) {
        console.error('Falha em recuperar dados de agendamentos: ', error);
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
                schedulesData,
            }
        }
    }
}
