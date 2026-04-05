import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import YouTube, { YouTubeProps } from 'react-youtube';
import { 
  MailOpen, 
  Music, 
  Music2, 
  Calendar, 
  MapPin, 
  Heart, 
  Clock, 
  Send,
  Loader2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import confetti from 'canvas-confetti';
import didiImage from './assets/temp.jpeg';
import bhauImage from './assets/Bhau.jpeg';
import BackgraundImg from './assets/background1.jpeg';
import Background2 from './assets/background2.jpeg';
import { object } from 'motion/react-client';
// Initialize Gemini AI
// const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Comment {
  name: string;
  attendance: string;
  message: string;
  date: string;
}

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guestName, setGuestName] = useState('आमचे सन्माननीय अतिथी');
  const [brideImage, setBrideImage] = useState<string | null>(didiImage);
  const [groomImage, setGroomImage] = useState<string | null>(bhauImage);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [comments, setComments] = useState<Comment[]>([]);
  const [form, setForm] = useState({ name: '', attendance: 'येणार', message: '' });
  
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  const playerRef = useRef<any>(null);
  const videoId = 'L2wyFD153B0'; // Sukhakarta Dukhaharta - Lata Mangeshkar

  useEffect(() => {
    // Parse guest name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const to = urlParams.get('to');
    if (to) setGuestName(to);

    // Load comments
    const saved = localStorage.getItem('aura_invitation_comments');
    if (saved) setComments(JSON.parse(saved));

    // Start countdown
    const targetDate = new Date('May 10, 2026 12:10:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) {
        clearInterval(interval);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setCountdown({ 
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // const generateAIImages = async () => {
  //   // Only generate groom image if not already set
  //   if (groomImage) return;
  //   setIsGeneratingImages(true);
  //   try {
  //     const model = 'gemini-2.5-flash-image';
      
  //     const groomPrompt = "A handsome Indian groom in a traditional Marathi wedding sherwani and pheta (turban), smiling, professional wedding photography, luxury bokeh background, high resolution.";

  //     const groomRes = await genAI.models.generateContent({
  //       model,
  //       contents: [{ parts: [{ text: groomPrompt }] }]
  //     });

  //     const extractImage = (response: any) => {
  //       for (const part of response.candidates[0].content.parts) {
  //         if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  //       }
  //       return null;
  //     };

  //     setGroomImage(extractImage(groomRes));
  //   } catch (error) {
  //     console.error("Error generating groom image:", error);
  //     // Fallback to Unsplash if AI fails
  //     setGroomImage("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800");
  //   } finally {
  //     setIsGeneratingImages(false);
  //   }
  // };

  const openInvitation = () => {
    setIsOpen(true);
    // Both images are already loaded from local files
    
    // Cracker animation
    const end = Date.now() + 3 * 1000;
    const colors = ['#D4AF37', '#F5E6BE', '#FFFFFF', '#FFD700'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    if (playerRef.current) {
      try {
        playerRef.current.playVideo();
        setIsPlaying(true);
      } catch (e) {
        console.error("Play error:", e);
      }
    }
  };

  const toggleAudio = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    setIsPlayerReady(true);
    // If user already clicked open, start playing
    if (isOpen) {
      event.target.playVideo();
      setIsPlaying(true);
    }
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    // If video ended, loop it
    if (event.data === 0) {
      event.target.playVideo();
    }
  };

  useEffect(() => {
    if (isOpen && isPlayerReady && playerRef.current && !isPlaying) {
      try {
        playerRef.current.playVideo();
        setIsPlaying(true);
      } catch (e) {
        console.error("Auto-play on ready failed:", e);
      }
    }
  }, [isOpen, isPlayerReady, isPlaying]);

  const submitRSVP = (e: React.FormEvent) => {
    e.preventDefault();
    const newComment: Comment = {
      ...form,
      date: new Date().toLocaleString()
    };
    const updated = [newComment, ...comments];
    setComments(updated);
    localStorage.setItem('aura_invitation_comments', JSON.stringify(updated));
    setForm({ name: '', attendance: 'येणार', message: '' });
  };

  return (
    <div 
      className="min-h-screen selection:bg-gold/30 bg-cream w-full relative overflow-hidden"
      style={{
        minHeight: '100vh',
        width: '100%',
      }}
    >
      {/* Overlay for better content readability */}
      <div className="fixed inset-0 bg-black/30 pointer-events-none z-[1]"></div>
      
      {/* Hidden YouTube Player (Always rendered to initialize API) */}
      <div className="fixed bottom-0 left-0 w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden">
        <YouTube 
          videoId={videoId} 
          opts={{
            height: '1',
            width: '1',
            playerVars: {
              autoplay: 0,
              controls: 0,
              loop: 1,
              playlist: videoId,
              origin: window.location.origin || '*',
              enablejsapi: 1,
              playsinline: 1,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              iv_load_policy: 3
            },
          }} 
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
        />
      </div>

      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -1000 }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-white text-center px-6 overflow-hidden min-h-screen"
          >
            <div className="fixed inset-0 z-0 overflow-hidden">
              <img 
                src={BackgraundImg}
                className="w-full h-full object-contain"
                style={{
                  objectPosition: 'center top',
                  objectFit: 'contain',
                  filter: 'blur(1px)',
                  transform: 'scale(1.03)',
                }}
                alt="Wedding Background"
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative z-10 space-y-6 max-w-md"
            >
              <div className="space-y-2 ">
                <p className="font-montserrat tracking-[0.4em] text-xs uppercase  text-amber-300 ">निमंत्रण</p>
                <div className="w-12 h-0.5 bg-gold mx-auto"></div>
              </div>
              
              <h1 className="font-yatra text-6xl md:text-8xl   text-amber-300  py-2">शुभविवाह</h1>
              
              <div className="space-y-4">
                <h2 className="font-yatra text-4xl md:text-5xl leading-tight">ऋतुजा आणि आनंद</h2>
                <div className="flex items-center justify-center gap-4 text-amber-300 font-montserrat text-sm tracking-widest">
                  <span>१० मे २०२६</span>
                  <span className="w-1 h-1 bg-gold rounded-full"></span>
                  <span>गंगोत्री मंगल कार्यालय</span>
                </div>
              </div>
              
              <div className="pt-8 space-y-4">
                <p className="text-lg opacity-80 italic">सप्रेम नमस्कार,</p>
                <p className="text-2xl font-semibold font-yatra leading-relaxed  text-amber-300 ">{guestName}</p>
                <p className="text-sm opacity-70 max-w-[280px] mx-auto">आमच्या लग्नाच्या शुभ मुहूर्तावर आपणास सहकुटुंब सहपरिवार आग्रहाचे निमंत्रण!</p>
                
                <button 
                  onClick={openInvitation}
                  className="px-10 py-4 bg-gold hover:bg-gold-dark text-white rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center gap-3 mx-auto group font-yatra text-2xl mt-10 border border-white/20"
                >
                  <MailOpen className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  आमंत्रण उघडा
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10"
        >
          <div className="fixed bottom-6 right-6 z-50">
            <button 
              onClick={toggleAudio}
              className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 border-2 ${isPlaying ? 'bg-gold text-white border-white/20 animate-pulse' : 'bg-white text-gold border-gold/20'}`}
            >
              {isPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              {!isPlaying && (
                <span className="absolute -top-12 right-0 bg-white text-gold text-[10px] px-2 py-1 rounded-md shadow-md whitespace-nowrap font-bold animate-bounce border border-gold/20">
                  गाणे सुरू करा
                </span>
              )}
            </button>
          </div>

          {/* Hero Section */}
          <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10">
              <img 
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1920" 
                className="w-full h-full object-cover"
                alt="Hero Background"
              />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-4xl space-y-8 relative z-10"
            >
              <p className="font-montserrat tracking-[0.5em] text-gold text-sm uppercase font-bold">शुभविवाह सोहळा</p>
              <h1 className="font-yatra text-7xl md:text-9xl gold-gradient-text text-glow py-4 leading-tight">ऋतुजा आणि आनंद</h1>
              <p className="font-yatra text-xl md:text-3xl text-charcoal/80 max-w-2xl mx-auto leading-relaxed">"पत्रिका हिच अक्षद समजुन लग्न कार्यास अगत्य येण्याचे करावे."</p>
              
              {/* Countdown */}
              <div className="grid grid-cols-4 gap-3 md:gap-6 pt-12 max-w-2xl mx-auto">
                {Object.entries(countdown).map(([key, val]) => (
                  <motion.div 
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white/60 backdrop-blur-md p-3 md:p-6 rounded-2xl border border-gold/20 shadow-lg"
                  >
                    <span className="block text-3xl md:text-5xl font-yatra text-gold">{val}</span>
                    <span className="block text-[10px] md:text-sm uppercase tracking-widest text-charcoal/60 mt-2 font-yatra">
                      {key === 'days' ? 'दिवस' : key === 'hours' ? 'तास' : key === 'minutes' ? 'मि' : 'से'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Bride & Groom Details */}
          <section
  className="min-h-screen py-24 px-6 bg-cream bg-gradient-to-br from-cream to-white"
  style={{
    backgroundImage: `url('${BackgraundImg}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'top center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
  }}
>
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-16 items-start">
                {/* Bride */}
                <motion.div 
                  initial={{ opacity: 0, y: 40, x: -20 }}
                  whileInView={{ opacity: 1, y: 0, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-8 text-center"
                >
                  <div className="img-frame mx-auto w-72 h-96 sm:w-76 sm:h-[28rem] lg:w-80 lg:h-96 overflow-hidden shadow-2xl flex items-center justify-center bg-white/50 rounded-2xl">
                    {isGeneratingImages ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-gold" />
                        <p className="text-xs text-gold font-yatra">AI प्रतिमा तयार होत आहे...</p>
                      </div>
                    ) : (
                      <img 
                        src={brideImage || didiImage} 
                        alt="Bride" 
                        className="w-full h-full object-cover border-4 border-transparent hover:scale-105 transition-transform duration-700 hover:border-amber-300" 
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-white p-10 rounded-3xl shadow-xl border border-gold/10 space-y-6"
                  >
                    <h3 className="font-yatra text-4xl text-gold">।। वधु ।।</h3>
                    <div className="space-y-4 marathi-fit">
                      <h4 className="text-3xl font-bold text-charcoal font-yatra leading-tight">चि. सौ. कां. ऋतुजा उर्फ वैष्णवी</h4>
                      <p className="text-charcoal/70 leading-relaxed text-lg">
                        श्रीमती वंदनाताई व स्व.श्री. किशोरराव भगवंतराव ठाकरे <br />
                        रा. भुगांव ता. अचलपूर जि. अमरावती यांची कन्या <br />
                        <span className="text-sm italic text-gold font-bold">(श्री. अरविंद म. घोम यांची भाची)</span>
                      </p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Groom */}
                <motion.div 
                  initial={{ opacity: 0, y: 40, x: 20 }}
                  whileInView={{ opacity: 1, y: 0, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="space-y-8 text-center"
                >
                  <div className="img-frame mx-auto w-72 h-96 sm:w-76 sm:h-[28rem] lg:w-80 lg:h-96 overflow-hidden shadow-2xl flex items-center justify-center bg-white/50 rounded-2xl">
                    {isGeneratingImages ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-gold" />
                        <p className="text-xs text-gold font-yatra">AI प्रतिमा तयार होत आहे...</p>
                      </div>
                    ) : (
                      <img 
                        src={groomImage || bhauImage} 
                        alt="Groom" 
                        className="w-full h-full object-cover border-4 border-transparent  hover:scale-105 transition-transform duration-700 hover:border-amber-300 " 
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-white p-10 rounded-3xl shadow-xl border border-gold/10 space-y-6"
                  >
                    <h3 className="font-yatra text-4xl text-gold">।। वर ।।</h3>
                    <div className="space-y-4 marathi-fit">
                      <h4 className="text-3xl font-bold text-charcoal font-yatra leading-tight">चि. आनंद उर्फ केशव</h4>
                      <p className="text-charcoal/70 leading-relaxed text-lg">
                        सौ. निलिमाताई व श्री. निरंजनराव वामनराव दहीहांडे <br />
                        रा. रामापूर (बेलज) ह.मु. देवमाळी परतवाडा ता. अचलपूर जि. अमरावती यांचे चिरंजीव
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Save The Date */}
          <section className="py-24 px-6 bg-white">
            <div className="max-w-4xl mx-auto text-center space-y-16">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-yatra text-5xl md:text-6xl text-charcoal mb-4">विवाह मुहूर्त</h2>
                <div className="w-32 h-1.5 bg-gold mx-auto rounded-full"></div>
              </motion.div>

              <div className="grid md:grid-cols-1 gap-12 max-w-2xl mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-cream p-10 md:p-16 rounded-[3rem] shadow-2xl border-4 border-gold/10 space-y-8 relative overflow-hidden hover:border-amber-300"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/5 rounded-tr-full"></div>
                  
                  <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-12 h-12 text-gold" />
                  </div>
                  
                  <h3 className="font-yatra text-4xl md:text-5xl gold-gradient-text py-2">शुभविवाह मुहूर्त</h3>
                  
                  <div className="space-y-6 text-charcoal/80 marathi-fit">
                    <p className="text-3xl md:text-4xl font-bold font-yatra">रविवार, १० मे २०२६</p>
                    <p className="text-2xl md:text-3xl font-yatra">दुपारी १२ वाजून १० मिनिटांनी</p>
                    <p className="text-xl md:text-2xl italic font-yatra text-gold">मिती वैशाख कृष्ण ८</p>
                  </div>
                  
                  <div className="pt-10 border-t-2 border-gold/20 mt-8">
                    <p className="font-montserrat text-sm uppercase tracking-[0.4em] text-gold mb-4 font-bold">विवाह स्थळ</p>
                    <div className="space-y-3 marathi-fit">
                      <p className="text-3xl font-bold text-charcoal font-yatra">गंगोत्री मंगल कार्यालय</p>
                      <p className="text-xl text-charcoal/70 leading-relaxed">अंबिका लॉन्स जवळ, धारणी रोड, परतवाडा</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="py-24 px-6 bg-cream">
            <div className="max-w-5xl mx-auto text-center space-y-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-yatra text-4xl text-charcoal mb-4">नकाशा</h2>
                <p className="text-charcoal/60">विवाह स्थळाचा नकाशा</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white h-[450px]"
              >
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.361448651848!2d77.505555!3d21.257222!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd6963f00000001%3A0x0!2zMjHCsDE1JzI2LjAiTiA3N8KwMzAnMjAuMCJF!5e0!3m2!1sen!2sin!4v1647856345678!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                  title="Venue Map"
                ></iframe>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="pt-6"
              >
                <a 
                  href="https://maps.app.goo.gl/GJae4FsAFeqPmi3t7" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-white rounded-full hover:bg-gold-dark transition-all shadow-lg font-yatra text-xl"
                >
                  <MapPin className="w-5 h-5" />
                  नकाशात पहा
                </a>
              </motion.div>
            </div>
          </section>

          {/* RSVP & Guestbook */}
          <section className="py-24 px-6 bg-white">
            <div className="max-w-3xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="font-playfair text-4xl text-charcoal mb-4">शुभेच्छा संदेश</h2>
                <p className="text-charcoal/60">तुमच्या शुभेच्छा आमच्यासाठी मौल्यवान आहेत</p>
              </motion.div>

              {/* RSVP Form */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-cream p-8 md:p-12 rounded-3xl shadow-sm border border-gold/5 mb-12"
              >
                <form onSubmit={submitRSVP} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-charcoal/50 font-semibold">पूर्ण नाव</label>
                      <input 
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        type="text" 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-gold/10 focus:border-gold outline-none transition-colors bg-white" 
                        placeholder="तुमचे नाव" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-charcoal/50 font-semibold">उपस्थिती</label>
                      <select 
                        value={form.attendance}
                        onChange={e => setForm({...form, attendance: e.target.value})}
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-gold/10 focus:border-gold outline-none transition-colors bg-white"
                      >
                        <option value="येणार">मी नक्की येणार</option>
                        <option value="येणार नाही">येता येणार नाही</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-charcoal/50 font-semibold">संदेश</label>
                    <textarea 
                      value={form.message}
                      onChange={e => setForm({...form, message: e.target.value})}
                      required 
                      rows={4} 
                      className="w-full px-4 py-3 rounded-xl border border-gold/10 focus:border-gold outline-none transition-colors bg-white" 
                      placeholder="तुमच्या शुभेच्छा..."
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full py-4 bg-gold hover:bg-gold-dark text-white rounded-xl font-semibold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    संदेश पाठवा
                  </button>
                </form>
              </motion.div>

              {/* Comments List */}
              <div className="space-y-6">
                <h3 className="font-playfair text-2xl text-charcoal mb-6">शुभेच्छा ({comments.length})</h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {comments.map((comment, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="bg-cream/50 p-6 rounded-2xl border border-gold/5 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-charcoal">{comment.name}</h4>
                        <span className="text-[10px] uppercase px-2 py-1 rounded bg-gold/10 text-gold font-bold">{comment.attendance}</span>
                      </div>
                      <p className="text-charcoal/70 text-sm italic">{comment.message}</p>
                      <p className="text-[10px] text-charcoal/30 mt-4">{comment.date}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>


          {/* new added section */}

           <section
             className="py-3 md:py-24 px-6 text-center mb-1 bg-cream"
             style={{
               backgroundImage: `url('${Background2}')`,
               backgroundSize: 'contain',
               backgroundPosition: 'center ',
               backgroundRepeat: 'no-repeat',
               minHeight: '480px',
               maxHeight: '700px',
               transform: 'scale(1.03)',
             }}
           >
            <div className="absolute inset-0 bg-black/30 font-bold"></div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10 max-w-2xl mx-auto space-y-8 text-center"
            >
              <h3 className="font-playfair text-3xl md:text-4xl text-white shadow-lg px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 via-gold to-amber-500 inline-block">
                ।। आमच्या दीदीच्या लग्नाला यायचं बरं का! ।।
              </h3>
              <div className="text-balance ">
                <h3 className="text-xl md:text-2xl text-white font-bold tracking-wide leading-tight drop-shadow-lg">
                  वैभवी, सागरीका, क्षितिजा, मोहित, शंतनु.
                </h3>
              </div>
            </motion.div>
          </section>


          {/* Vinit Section */}
          <section className="py-16 px-6 bg-cream text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <h4 className="text-xl font-playfair">* अरविंद घोम व माया घोम *<br /><span>(यांची भाची)</span> </h4>
              <h3 className="font-playfair text-2xl text-gold">|| आपले कृपाभिलाषी ||</h3>
              <div className="grid grid-cols-2 gap-4 text-charcoal/80">
             <p>श्री. अरूणराव भ. ठाकरे</p>
             <p>श्री. मनोज अ. ठाकरे</p>
             <p>श्री. सुरेशराव भ. ठाकरे</p>
              <p>चि. शुभम सु. ठाकरे</p>
              <p> डॉ. श्री. गणेशराव म. ठाकरे</p>
               
                <p>चि. शंतनु कि. ठाकरे</p>
                
              </div>
            </motion.div>
          </section>

          {/* Footer */}
          <footer className="py-12 px-6 text-center bg-white border-t border-gold/10 mb-10">
            <h2 className="font-playfair text-3xl text-gold mb-4">ऋतुजा आणि आनंद</h2>
            <p className="text-xs text-charcoal/40 uppercase tracking-[0.3em] mb-6">आमच्या आनंदात सहभागी झाल्याबद्दल धन्यवाद</p>
            <div className="pt-6 border-t border-gold/5 max-w-xs mx-auto">
              <p className="text-[10px] text-charcoal/30 uppercase tracking-widest mb-2">Digital Invitation By</p>
              <p className="text-sm font-yatra text-gold">Shantanu Kishorrao Thakre</p>
            </div>
          </footer>
        </motion.main>
      )}
    </div>
  );
}
