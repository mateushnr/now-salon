import { ArrowDown, Calendar, ChevronDown, Clock} from 'lucide-react'
import styles from './EmployeeHeader.module.css'
import logo from '@/../public/logoNowSalon.svg'
import userIcon from '@/../public/images/userIcon.svg'
import Image from 'next/image'
import Link from 'next/link'
import { useContext, useEffect, useRef, useState } from 'react'
import { ModalLogin } from '../modal/ModalLogin'
import { AuthContext } from '@/contexts/AuthContext'

type EmployeeHeaderProps = {
    employeeAccessLevel: string
}

export const EmployeeHeader = ({employeeAccessLevel} : EmployeeHeaderProps) => {
    const [isManageOptionsOpen, setIsManageOptionsOpen] = useState(false);

    const manageOptionsRef = useRef<HTMLLIElement>(null);

    const {logout} = useContext(AuthContext)

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if(!manageOptionsRef.current?.contains(e.target as Node))setIsManageOptionsOpen(false)
          };
      document.addEventListener("click", handleOutsideClick);
      return () => {
        document.removeEventListener("click", handleOutsideClick);
      };
    }, []);

  return (
    <>
    <header className={styles.header}>
        <div className={styles.headerContainer}>
            <nav className={styles.navPrimary}>
                <Link href={"/employee"} className={styles.logoLight}>Now Salon</Link>
                <ul className={styles.navManageListContainer}>
                    <li>
                        <Link href={'/employee/myservices'}>Meus serviços</Link>
                    </li>
                    {employeeAccessLevel == 'Admin'
                    ?(
                        <li ref={manageOptionsRef} className={styles.navManageListContainer}>
                        <button onClick={() => setIsManageOptionsOpen(!isManageOptionsOpen)}>Gerenciar <ChevronDown/></button>

                        {isManageOptionsOpen 
                        ? (<ul className={styles.navManageList}>
                            <li><Link href='/employee/salon'>Estabelecimento</Link></li> 
                            <li><Link href='/employee/service'>Serviços</Link></li> 
                            <li><Link href='/employee/employee'>Funcionários</Link></li> 
                            <li><Link href='/employee/customer'>Clientes</Link></li> 
                            <li><Link href='/employee/schedule'>Agendamentos</Link></li> 
                         </ul>)
                        : null
                        }
                    </li>)
                    : null}
                    
                </ul>
        </nav>

            <button className={styles.btnSair} onClick={()=> logout()}>Sair</button>
        </div>
       
    </header>
    </>
  )
}

