import { Facebook, Instagram, MapPin, Phone} from 'lucide-react'
import styles from './Footer.module.css'

export const Footer = ()=>{
    return (
        <footer className={styles.footer}>
           <div className={styles.containerBrandSocial}>
                <strong>Now Salon</strong>
                <div>
                    <Instagram size={32}/>
                    <Facebook size={32}/>
                </div>
           </div>
           <address className={styles.containerAddress}>
                <div className={styles.titleInfoContainer}>
                    <MapPin size={32}/>
                    <strong>Localização</strong>
                </div>
                <div className={styles.itemsInfo}>
                    <p>Rua fulano de tal, 177</p>
                    <p>Bairro ali perto</p>
                    <p>Araçatuba, SP</p>
                </div>
           </address>
           <div className={styles.containerContacts}>
                <div className={styles.titleInfoContainer}>
                    <Phone size={32}/>
                    <strong>Contato</strong>
                </div>
                <div className={styles.itemsInfo}>
                    <p>(18) 99999-9999</p>
                    <p>nowsalon@contato.com</p>
                </div>
           </div>
        </footer>
      )
}

