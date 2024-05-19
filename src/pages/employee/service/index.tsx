import { recoverCustomerAuthData, recoverEmployeeAuthData } from '@/contexts/AuthContext';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import Head from 'next/head';

import styles from '@/styles/pages/Service.module.css'
import { EmployeeHeader } from '@/components/EmployeeHeader';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Filter } from '@/components/Filter';
import { ListTable } from '@/components/ListTable';
import { useRef, useState } from 'react';
import { Service } from '@/@types/service';

interface ListServiceProps {
    employeeAccessLevel: string
    servicesData: Service[]
}

export default function ListService({employeeAccessLevel, servicesData}: ListServiceProps) {
    const router = useRouter()
    const actionFormRef = useRef<HTMLFormElement>(null);

    const [isItemSelected, setIsItemSelected] = useState(false)
    const [wasItemDeleted, setWasItemDeleted] = useState(false)
    const [filteredServicesData, setFilteredServicesData] = useState<Service[] | []>(servicesData)

    const handleFilterServiceList = (searchedValue: string, searchedOption: string) => {
        const filteredData = servicesData.filter((service) => {
            switch (searchedOption) {
                case 'name': {
                    return service.name.toLowerCase().includes(searchedValue.toLowerCase());
                }
                case 'duration': {
                    return service.estimatedTime.includes(searchedValue);
                }
                case 'price': {
                    return service.price <= Number(searchedValue);
                }
                case 'status': {
                    return service.status.toLowerCase().includes(searchedValue.toLowerCase());
                }
                default: {
                    return true;
                }
            }
        })

        setFilteredServicesData(filteredData)
    }

    const handleClearFilterServiceList = () => {
        setFilteredServicesData(servicesData)
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
                const response = await fetch(`http://localhost:8080/api-now-salon/services/api/?id=${idItemToDelete}`, {
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
                        alert("Erro ao deletar serviço")
                    }
                }
            } catch (error) {
            alert("Erro ao deletar serviço: " + error)
            }
        }
    };

    const handleEditClick = () => {
        const formAction = actionFormRef.current

        if(formAction !== null){
            const formData = new FormData(formAction);
            const idItemToEdit = formData.get('selectedId');

            router.push(`service/edit/${idItemToEdit}`)
        }
    };

    async function handleSubmitActionService(event: React.FormEvent<HTMLFormElement>){
        event.preventDefault()
    }

    const formattedServiceData = filteredServicesData.map(service=>{
        return [service.id.toString(), service.name, service.estimatedTime, service.price.toString(), service.status]
    })

    return (
        <>
        <Head>
            <title>Gerenciar serviços</title>
        </Head>
        <EmployeeHeader employeeAccessLevel={employeeAccessLevel}/>
        <main className={styles.container}>
            <header className={styles.headerService}>
                <h1 className={styles.pageTitle}>Lista de serviços</h1>
                <Link href="/employee/service/register" className={styles.createServiceButton}>Cadastrar novo serviço</Link>
            </header>
            
            <span className={styles.separatorDetail}/>

                <section>
                    <Filter filterOptions={[
                        {
                            value: 'name',
                            label: 'Nome'
                        }, 
                        {
                            value: 'duration',
                            label: 'Duração'
                        },
                        {
                            value: 'price',
                            label: 'Preço'
                        },
                        {
                            value: 'status',
                            label: 'Status'
                        },
                    ]} handleFilterList={handleFilterServiceList} handleClearFilterList={handleClearFilterServiceList}/>
                    <form ref={actionFormRef} onSubmit={handleSubmitActionService} className={styles.listForm}>
                        <ListTable handleSelectionChange={handleSelectionChange}tableHeaders={['Nome', 'Tempo estimado', 'Preço', 'Status']} tableData={formattedServiceData}/>

                        {wasItemDeleted ? (<span className={styles.deletedItemMessage}>Serviço deletado</span>) : null}
                        

                        <div className={styles.containerActionButtons}>
                            <button 
                                type="submit" 
                                onClick={handleEditClick}
                                disabled={!isItemSelected} 
                                className={styles.editButton}
                            >
                                Editar serviço
                            </button>
                            <button 
                                type="submit" 
                                onClick={handleDeleteClick}
                                disabled={!isItemSelected} 
                                className={styles.deleteButton}
                            >
                                Excluir serviço
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

    let servicesData = []

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
