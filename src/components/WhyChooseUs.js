import React, { useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { CaretRight, CaretLeft, Lightbulb, Heart, Globe, Lock } from 'phosphor-react';
import '../assets/css/WhyChooseUs.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

const WhyChooseUs = () => {
  const swiperRef = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    AOS.refresh();

    const swiper = swiperRef.current?.swiper;
    if (swiper?.navigation && typeof swiper.navigation.init === 'function') {
      swiper.navigation.init();
      swiper.navigation.update();
    }
  }, []);

  const cardData = [
    { icon: <Lightbulb size={32} />, title: 'Innovative Solutions', desc: 'We offer cutting-edge solutions that benefit both caregivers and families.' },
    { icon: <Heart size={32} />, title: 'Trustworthy Care', desc: 'Our caregivers are vetted, experienced, and compassionate.' },
    { icon: <Globe size={32} />, title: 'Global Reach', desc: 'We connect families and caregivers from across the globe.' },
    { icon: <Lock size={32} />, title: 'Secure & Safe', desc: 'Your privacy and security are our top priority.' },
  ];

  return (
    <section className="why-choose-section">
      <Swiper
        ref={swiperRef}
        modules={[Navigation]}
        navigation={{
          nextEl: '.custom-next',
          prevEl: '.custom-prev',
        }}
        spaceBetween={20}
        breakpoints={{
          0: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
      >
        {cardData.map((card, index) => (
          <SwiperSlide key={index}>
            <div
              className={`why-card ${index % 2 === 0 ? 'why-card-border-1' : 'why-card-border-2'}`}
              data-aos="fade-up"
            >
              <div style={{ marginBottom: '15px' }}>{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="swiper-nav-container">
        <div className="custom-prev swiper-button-prev">
          <CaretLeft size={32} />
        </div>
        <div className="custom-next swiper-button-next">
          <CaretRight size={32} />
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;