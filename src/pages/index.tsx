import { recoverCustomerAuthData, recoverEmployeeAuthData } from '@/contexts/AuthContext';
import { CustomerHeader } from '@/components/CustomerHeader';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import Head from 'next/head';
import barberVector from  '@/../public/images/barberVector.png'
import cuttingHair from  '@/../public/images/cuttingHair.png'
import shavingBeard from  '@/../public/images/shavingBeard.png'
import shavingEyebrow from  '@/../public/images/shavingEyebrow.png'

import styles from '@/styles/Home.module.css'
import Image from 'next/image';
import { DarkBodyGlobalStyle } from '@/styles/BodyGlobalStyle';
import { Footer } from '@/components/Footer';

interface HomeProps {
  isCustomerAuthenticated: boolean
}

export default function Home({isCustomerAuthenticated}: HomeProps) {

  return (
    <>
    <Head>
        <title>Home</title>
        <style>{DarkBodyGlobalStyle}</style>
    </Head>
    <CustomerHeader isCustomerAuthenticated={isCustomerAuthenticated}/>
    <main>
      <div className={styles.mainContentWrapper}>
        <span className={styles.lightDetail1}/>
        <span className={styles.lightDetail2}/>
        <span className={styles.lightDetail3}/>

        <section className={`${styles.container} ${styles.homeMainContentContainer}`}>
          <div>
            <h1>Faça seu agendamento <strong>agora!</strong></h1>
            <p>O processo de agendamento é rápido, escolha o serviço que procura e o profissional que fará o trabalho. Depois é só decidir o dia e horário que você deseja ser atendido!</p>
            <button>Agendar</button>
          </div>
          <Image
            priority={true}
            src={barberVector}
            alt="Desenho de um homem barbudo"
          />
        </section>
      </div>
     <div className={styles.mainServicesWrapper}>
        <section className={`${styles.container} ${styles.homeMainServicesContainer}`}>
          <h1>Principais serviços</h1>
          <div className={styles.mainServicesContainer}>
            <div>
              <Image
                priority={true}
                src={cuttingHair}
                alt="Desenho de um homem barbudo"
              />
              <strong>Cabelo</strong>
            </div>
            <div>
              <Image
                priority={true}
                src={shavingBeard}
                alt="Desenho de um homem barbudo"
              />
              <strong>Barba</strong>
            </div>
            <div>
              <Image
                priority={true}
                src={shavingEyebrow}
                alt="Desenho de um homem barbudo"
              />
              <strong>Sombrancelha</strong>
            </div>
          </div>
        </section>
     </div>
     <div>
        <section className={`${styles.container} ${styles.containerContactPartnership}`}>
          <form className={styles.formContactPartnership}>
            <div>
              <label>Email</label>
              <input type='text'/>
            </div>
            <div>
              <label>Motivo do contato</label>
              <textarea/>
            </div>
            <button disabled>Enviar mensagem</button>
          </form>
          <div className={styles.titleContactPartnershipContainer}>
            <h2>CONTATE</h2>
            <h2>NOS</h2>
            <h2>PARA PARCERIAS</h2>
          </div>
          <span className={styles.rectangleDetail}/>
        </section>
     </div>
    </main>
    <Footer/>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {'nowsalon.customer-token': tokenCustomer, 'nowsalon.employee-token': tokenEmployee} = parseCookies(context)

    let isCustomerAuthenticated = false
    let isEmployeeAuthenticated = false

    const customer = await recoverCustomerAuthData(tokenCustomer)
    const employee = await recoverEmployeeAuthData(tokenEmployee)

    if(customer != null){
        isCustomerAuthenticated = true
    }

    if(employee != null){
        isEmployeeAuthenticated = true
    }

    if (isEmployeeAuthenticated){
      return {
          redirect: {
              destination: '/employee',
              permanent: false,
          }
      }
    }

  return{
    props: {
      isCustomerAuthenticated,
    }
  }
}
