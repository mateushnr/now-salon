import { AuthContext, recoverCustomerAuthData, recoverEmployeeAuthData } from '@/contexts/AuthContext';
import { CustomerHeader } from '@/components/CustomerHeader';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import Head from 'next/head';
import { Footer } from '@/components/Footer';

import styles from '@/styles/pages/Employee.module.css'
import { TextInput } from '@/components/form/TextInput';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { handleEmployeeRegistrationChange } from '@/formatters/employeeRegistration';
import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { EmployeeHeader } from '@/components/EmployeeHeader';

interface EmployeeProps {
  employeeAccesssLevel: string
  employeeName: string
}

export default function Employee({employeeAccesssLevel, employeeName}: EmployeeProps) {

    return (
        <>
        <Head>
            <title>Portal funcionários</title>
        </Head>
        <EmployeeHeader employeeAccesssLevel={employeeAccesssLevel}/>
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
                employeeAccesssLevel: employee.accessLevel,
                employeeName: employee.name
            }
        }
    }
}
