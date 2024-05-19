import { recoverCustomerAuthData, recoverEmployeeAuthData } from '@/contexts/AuthContext';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import Head from 'next/head';

import styles from '@/styles/pages/Employee.module.css'
import { EmployeeHeader } from '@/components/EmployeeHeader';

interface EmployeeProps {
  employeeAccessLevel: string
  employeeName: string
}

export default function Employee({employeeAccessLevel, employeeName}: EmployeeProps) {

    return (
        <>
        <Head>
            <title>Portal funcionários</title>
        </Head>
        <EmployeeHeader employeeAccessLevel={employeeAccessLevel}/>
        <main className={styles.container}>
           <h1 className={styles.welcomeEmployeeTitle}>Bem vindo <strong>{employeeName}</strong></h1>
           <span className={styles.separatorDetail}/>
           <h2 className={styles.titleWeekSchedules}>Serviços agendados para você esta semana</h2>
        </main>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const {'nowsalon.customer-token': tokenCustomer, 'nowsalon.employee-token': tokenEmployee} = parseCookies(context)

    const customer = await recoverCustomerAuthData(tokenCustomer)
    const employee = await recoverEmployeeAuthData(tokenEmployee)

    if(customer != null || employee == null){
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
                employeeName: employee.name
            }
        }
    }
}
