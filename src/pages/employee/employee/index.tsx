import { recoverCustomerAuthData, recoverEmployeeAuthData } from '@/contexts/AuthContext';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import Head from 'next/head';

import styles from '@/styles/pages/ManageEmploye.module.css'
import { EmployeeHeader } from '@/components/EmployeeHeader';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Filter } from '@/components/Filter';
import { ListTable } from '@/components/ListTable';
import { useRef, useState } from 'react';
import { Service } from '@/@types/service';
import { Employee } from '@/@types/employee';

interface ListEmployeeProps {
    employeeAccessLevel: string
    employeesData: Employee[]
}

export default function ListEmployee({employeeAccessLevel, employeesData}: ListEmployeeProps) {
    const router = useRouter()
    const actionFormRef = useRef<HTMLFormElement>(null);

    const [isItemSelected, setIsItemSelected] = useState(false)
    const [wasItemDeleted, setWasItemDeleted] = useState(false)
    const [filteredEmployeesData, setFilteredEmployeesData] = useState<Employee[] | []>(employeesData)

    const handleFilterEmployeeList = (searchedValue: string, searchedOption: string) => {
        const filteredData = employeesData.filter((employee) => {
            switch (searchedOption) {
                case 'registration': {
                    return employee.registration.toString().toLowerCase().includes(searchedValue.toLowerCase());
                }
                case 'name': {
                    return employee.name.toLowerCase().includes(searchedValue.toLowerCase());
                }
                case 'phone': {
                    return employee.phone.toLowerCase().includes(searchedValue.toLowerCase());
                }
                case 'role': {
                    return employee.role.toLowerCase().includes(searchedValue.toLowerCase());
                }
                case 'accessLevel': {
                    return employee.accessLevel.toLowerCase().includes(searchedValue.toLowerCase());
                }
                default: {
                    return true;
                }
            }
        })

        setFilteredEmployeesData(filteredData)
    }

    const handleClearFilterEmployeeList = () => {
        console.log("chegou")
        setFilteredEmployeesData(employeesData)
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
                const response = await fetch(`http://localhost:8080/api-now-salon/employees/api/?id=${idItemToDelete}`, {
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
                        alert("Erro ao deletar funcionário")
                    }
                }
            } catch (error) {
            alert("Erro ao deletar funcionário: " + error)
            }
        }
    };

    const handleEditClick = () => {
        const formAction = actionFormRef.current

        if(formAction !== null){
            const formData = new FormData(formAction);
            const idItemToEdit = formData.get('selectedId');

            router.push(`employee/edit/${idItemToEdit}`)
        }
    };

    async function handleSubmitActionEmployee(event: React.FormEvent<HTMLFormElement>){
        event.preventDefault()
    }

    const formattedEmployeeData = filteredEmployeesData.map(service=>{
        return [service.registration.toString(), service.registration.toString(), service.name, service.phone, service.role, service.accessLevel]
    })

    return (
        <>
        <Head>
            <title>Gerenciar funcionários</title>
        </Head>
        <EmployeeHeader employeeAccessLevel={employeeAccessLevel}/>
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Lista de funcionários</h1>
                <Link href="/employee/employee/register" className={styles.createButton}>Cadastrar novo funcionário</Link>
            </header>
            
            <span className={styles.separatorDetail}/>

                <section>
                    <Filter filterOptions={[
                        {
                            value: 'registration',
                            label: 'Matrícula'
                        }, 
                        {
                            value: 'name',
                            label: 'Nome'
                        },
                        {
                            value: 'phone',
                            label: 'Telefone'
                        },
                        {
                            value: 'role',
                            label: 'Cargo'
                        },
                        {
                            value: 'accessLevel',
                            label: 'Nível de acesso'
                        },
                    ]} handleFilterList={handleFilterEmployeeList} handleClearFilterList={handleClearFilterEmployeeList}/>
                    <form ref={actionFormRef} onSubmit={handleSubmitActionEmployee} className={styles.listForm}>
                        <ListTable handleSelectionChange={handleSelectionChange}tableHeaders={['Registro', 'Nome', 'Telefone', 'Cargo', 'Acesso']} tableData={formattedEmployeeData}/>

                        {wasItemDeleted ? (<span className={styles.deletedItemMessage}>Funcionário deletado</span>) : null}
                        

                        <div className={styles.containerActionButtons}>
                            <button 
                                type="submit" 
                                onClick={handleEditClick}
                                disabled={!isItemSelected} 
                                className={styles.editButton}
                            >
                                Editar funcionário
                            </button>
                            <button 
                                type="submit" 
                                onClick={handleDeleteClick}
                                disabled={!isItemSelected} 
                                className={styles.deleteButton}
                            >
                                Excluir funcionário
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

    let employeesData = []

    try {
        const response = await fetch('http://localhost:8080/api-now-salon/employees/api', {
        });
    
        if (response.ok) {
           employeesData = await response.json();
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
                employeesData,
            }
        }
    }
}
