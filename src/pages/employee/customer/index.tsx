import { recoverCustomerAuthData, recoverEmployeeAuthData } from '@/contexts/AuthContext';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import Head from 'next/head';

import styles from '@/styles/pages/Customer.module.css'
import { EmployeeHeader } from '@/components/EmployeeHeader';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Filter } from '@/components/Filter';
import { ListTable } from '@/components/ListTable';
import { useRef, useState } from 'react';
import { Service } from '@/@types/service';
import { Customer } from '@/@types/customer';

interface ListServiceProps {
    employeeAccessLevel: string
    customersData: Customer[]
}

export default function ListCustomer({employeeAccessLevel, customersData}: ListServiceProps) {
    const router = useRouter()
    const actionFormRef = useRef<HTMLFormElement>(null);

    const [isItemSelected, setIsItemSelected] = useState(false)
    const [wasItemDeleted, setWasItemDeleted] = useState(false)
    const [filteredCustomersData, setFilteredCustomersData] = useState<Customer[] | []>(customersData)

    const handleFilterCustomerList = (searchedValue: string, searchedOption: string) => {
        const filteredData = customersData.filter((customer) => {
            switch (searchedOption) {
                case 'id': {
                    return customer.id.toString().toLowerCase().includes(searchedValue.toLowerCase());
                }
                case 'name': {
                    return customer.name.toLowerCase().includes(searchedValue.toLowerCase());
                }
                case 'email': {
                    return customer.email.toLowerCase().includes(searchedValue.toLowerCase());
                }
                case 'phone': {
                    return customer.phone.toLowerCase().includes(searchedValue.toLowerCase());
                }
                default: {
                    return true;
                }
            }
        })

        setFilteredCustomersData(filteredData)
    }

    const handleClearFilterCustomerList = () => {
        setFilteredCustomersData(customersData)
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
                const response = await fetch(`http://localhost:8080/api-now-salon/customers/api/?id=${idItemToDelete}`, {
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
                        alert("Erro ao deletar cliente")
                    }
                }
            } catch (error) {
            alert("Erro ao deletar cliente: " + error)
            }
        }
    };

    const handleEditClick = () => {
        const formAction = actionFormRef.current

        if(formAction !== null){
            const formData = new FormData(formAction);
            const idItemToEdit = formData.get('selectedId');

            router.push(`customer/edit/${idItemToEdit}`)
        }
    };

    async function handleSubmitActionCustomer(event: React.FormEvent<HTMLFormElement>){
        event.preventDefault()
    }

    const formattedCustomerData = filteredCustomersData.map(customer => {
        return [customer.id.toString(), customer.id.toString(), customer.name, customer.phone, customer.email]
    })

    return (
        <>
        <Head>
            <title>Gerenciar clientes</title>
        </Head>
        <EmployeeHeader employeeAccessLevel={employeeAccessLevel}/>
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Lista de clientes</h1>
                <Link href="/employee/customer/register" className={styles.createButton}>Cadastrar novo cliente</Link>
            </header>
            
            <span className={styles.separatorDetail}/>

                <section>
                    <Filter filterOptions={[
                        {
                            value: 'id',
                            label: 'Id'
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
                            value: 'email',
                            label: 'Email'
                        },
                    ]} handleFilterList={handleFilterCustomerList} handleClearFilterList={handleClearFilterCustomerList}/>
                    <form ref={actionFormRef} onSubmit={handleSubmitActionCustomer} className={styles.listForm}>
                        <ListTable handleSelectionChange={handleSelectionChange}tableHeaders={['Id', 'Nome', 'Telefone', 'Email']} tableData={formattedCustomerData}/>

                        {wasItemDeleted ? (<span className={styles.deletedItemMessage}>Serviço deletado</span>) : null}
                        

                        <div className={styles.containerActionButtons}>
                            <button 
                                type="submit" 
                                onClick={handleEditClick}
                                disabled={!isItemSelected} 
                                className={styles.editButton}
                            >
                                Editar cliente
                            </button>
                            <button 
                                type="submit" 
                                onClick={handleDeleteClick}
                                disabled={!isItemSelected} 
                                className={styles.deleteButton}
                            >
                                Excluir cliente
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

    let customersData = []

    try {
        const response = await fetch('http://localhost:8080/api-now-salon/customers/api', {
        });
    
        if (response.ok) {
            customersData = await response.json();
        }else{
          throw new Error('Falha em recuperar dados de clientes');
        }
    } catch (error) {
        console.error('Falha em recuperar dados de clientes: ', error);
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
                customersData,
            }
        }
    }
}
