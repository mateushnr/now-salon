import {Html, Head, Main, NextScript} from 'next/document'

export default function Document(){
    return(
        <Html>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com"/>
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

                <meta name="viewport" content="width=device-width, initial-scale=1" />

                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Raleway:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
            </Head>
            <body>
                <Main/>
                <NextScript/>
            </body>
        </Html>
    )
}