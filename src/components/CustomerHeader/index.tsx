import { Calendar, Clock} from 'lucide-react'
import styles from './CustomerHeader.module.css'
import scissorIcon from '@/../public/logoScissorsIcon.png'
import userIcon from '@/../public/images/userIcon.svg'
import Image from 'next/image'
import Link from 'next/link'
import { useContext, useEffect, useRef, useState } from 'react'
import { ModalLogin } from '../modal/ModalLogin'
import { AuthContext } from '@/contexts/AuthContext'

type CustomerHeaderProps = {
    isCustomerAuthenticated: boolean
}

export const CustomerHeader = ({isCustomerAuthenticated} : CustomerHeaderProps) => {
const [isUserOptionsOpen, setIsUserOptionsOpen] = useState(false);
const [isMenuMobileOpen, setIsMenuMobileOpen] = useState(false);
const [isModalLoginOpen, setIsModalLoginOpen] = useState(false);

const userOptionsRef = useRef<HTMLDivElement>(null);
const menuMobileRef = useRef<HTMLHeadElement>(null);
const modalLoginRef = useRef<HTMLFormElement>(null);
const btnOpenModalRef = useRef<HTMLButtonElement>(null);

const { logout } = useContext(AuthContext)

useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
        if(!userOptionsRef.current?.contains(e.target as Node))setIsUserOptionsOpen(false)
        
        if(!menuMobileRef.current?.contains(e.target as Node))setIsMenuMobileOpen(false)
   
        if(!modalLoginRef.current?.contains(e.target as Node) && !btnOpenModalRef.current?.isEqualNode(e.target as Node) )setIsModalLoginOpen(false)
    
      };
  document.addEventListener("click", handleOutsideClick);
  return () => {
    document.removeEventListener("click", handleOutsideClick);
  };
}, []);

  return (
    <>
    <header className={styles.header} ref={menuMobileRef}>
        <div>
            <nav className={styles.infoHeaderContainer} aria-label='Navegação portal'>
                <ul className={styles.infoList}>
                    <li>
                        <Calendar size={14}/>
                        <strong>Aberto terça, quarta, quinta, sexta e sábado</strong>
                    </li>
                    <li>
                        <Clock size={14}/>
                        <strong>Horários: 8:00 até 18:00</strong>
                    </li>
                </ul>
                {isCustomerAuthenticated 
                ? null
                : (<Link href='/portal'>Portal funcionários</Link>)}
            </nav>
        </div>
        <div>
        <nav className={styles.containerPrimaryNavigation} aria-label='Primária'>
            <div className={styles.primaryNavigation}>
                <div className={styles.containerMenuMobile}>
                    <Link href='/'>
                        <Image 
                            priority={true}
                            src={scissorIcon}
                            alt="Logo now salon"
                            aria-roledescription='Link para a home'
                            role='link'
                        />
                        <strong className={styles.logoDark}>Now Salon</strong>
                    </Link>
                    <div onClick={()=>{setIsMenuMobileOpen(!isMenuMobileOpen)}} className={styles.menuHamburger}>
                        <span/>
                        <span/>
                        <span/>
                    </div>
                </div>
                
                <ul data-active={isMenuMobileOpen} className={styles.navList}>
                    <li><Link href='#home'>Home</Link></li>
                    <li><Link href='#home'>Contato</Link></li>
                    <li><Link href='#home'>Agendar</Link></li>
                    {isCustomerAuthenticated 
                    ? (<li><Link href='#home'>Meus agendamentos</Link></li>)
                    : null}
                </ul>
            </div>
            
            {isCustomerAuthenticated 
            ? (
            <div data-active={isMenuMobileOpen} className={styles.userContainer} ref={userOptionsRef}>
                    <span  onClick={() => setIsUserOptionsOpen(!isUserOptionsOpen)} className={styles.userIconBackground}>
                        <Image 
                                src={userIcon}
                                width={24}
                                height={24}
                                alt="Logo now salon"
                                aria-roledescription='Link para a home'
                                role='link'
                        />
                    </span>

                    {isUserOptionsOpen 
                    ? (<div>
                        <button onClick={() => logout()}>Sair</button>
                    </div>)
                    : null
                    }
            </div>)
            : (<button ref={btnOpenModalRef} onClick={() => setIsModalLoginOpen(true)} data-active={isMenuMobileOpen}>Entrar</button>)}            
        </nav>
        </div>
        
    </header>

    <ModalLogin ref={modalLoginRef} modalLoginState={isModalLoginOpen} setIsModalLoginOpen={setIsModalLoginOpen}/>
    </>
  )
}

