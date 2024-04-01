import { Dispatch, LegacyRef, SetStateAction, forwardRef, useContext, useState} from 'react'
import styles from './ModalLogin.module.css'
import { CircleX } from 'lucide-react'
import { TextInput } from '@/components/form/TextInput'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { AuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'

const LoginSchema = z.object({
    email: z
      .string()
      .min(1, 'Informe seu email')
      .refine((value) => {
        const regex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/
        return regex.test(value)
      }, 'Email inválido'),
    password: z.string().min(1, 'Informe a sua senha').min(6, 'A senha tem no mínimo 6 caracteres')
  })

export type LoginCustomerFormData = z.infer<typeof LoginSchema>

type ModalLoginProps = {
    modalLoginState: boolean
    setIsModalLoginOpen: Dispatch<SetStateAction<boolean>>
}

type StatusCustomerLogin = {
  failed: boolean
  errorMessage: string | null
}

export const ModalLogin = forwardRef(function ModalLogin({modalLoginState, setIsModalLoginOpen}: ModalLoginProps, ref: LegacyRef<HTMLFormElement>) {

    const {register, handleSubmit, formState} = useForm<LoginCustomerFormData>({
        mode: 'onSubmit',
        resolver: zodResolver(LoginSchema)
    })

    const { signInCustomer } = useContext(AuthContext)
    
    const router = useRouter()

    const [loginCustomerStatus, setLoginCustomerStatus] = useState<StatusCustomerLogin>({failed: false, errorMessage: null})

    const handleCustomerLogin = async (data: LoginCustomerFormData) =>{
        const msgStatusLogin = await signInCustomer(data)

        if(msgStatusLogin !== null){
          setLoginCustomerStatus({failed: true, errorMessage: msgStatusLogin})
        }else{
          setLoginCustomerStatus({failed: false, errorMessage: null})
          router.reload()
        }
    }
  return (
    <>
    {modalLoginState 
    ? (
        <>
            <form onSubmit={handleSubmit(handleCustomerLogin)} className={styles.containerModalLogin} ref={ref}>
                <button onClick={()=> setIsModalLoginOpen(false)} className={styles.btnCloseModal}><CircleX size={32}/></button>

                <strong className={styles.titleLogin}>Login<span className={styles.detailTitleLogin}/></strong>
                <p className={styles.descriptionLogin}>Acesse a sua conta para agendar novos serviços</p>

                <div className={styles.containerFields}>
                    <TextInput type="text" field="Email" {...register('email')} error={formState.errors.email}/>
                    <TextInput type="password" field="Senha" {...register('password')} error={formState.errors.password}/>
                </div>

                <button className={styles.btnConfirmLogin} type='submit'>Entrar</button>

                {loginCustomerStatus.failed
                ?(<p className={styles.errorMessageLogin}>{loginCustomerStatus.errorMessage}</p>)
                : null
                }

                <Link className={styles.linkSignUp} href='/signup'>Não tenho conta no Now Salon</Link>
            </form>
            <div className={styles.modalWrapper}/>
        </>)
    : null}
    </>
    
   
    
  )
})

