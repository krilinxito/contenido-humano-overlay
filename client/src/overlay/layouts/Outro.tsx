import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SPRING_TORPE, CORTE_BRUSCO } from '../motionPresets';
import { MEMBER_IDS, MEMBERS, randomAdjetivo } from '../../config/members';
import { useOverlayStore, getMemberName } from '../../store/useOverlayStore';
import { LowPolyScene } from '../../three/LowPolyScene';
import { AvatarColumn } from '../../three/avatars/AvatarRow';
import { MarqueeText } from '../chrome/MarqueeText';
import { Carita } from '../chrome/Caritas';
import './Outro.css';

// Filas de créditos de miembros con alto FIJO: así el AvatarColumn (un solo
// Canvas superpuesto) sabe dónde cae cada busto sin medir el DOM.
const CREDIT_ROW_PX = 250;
const CREDIT_AVATAR_PX = 150; // = .outro__credito-avatar
const CREDIT_AVATAR_CENTER_PX = CREDIT_AVATAR_PX / 2;

const CREDITOS_EXTRA = [
  ['Dirección', 'nadie'],
  ['Producción', 'tampoco'],
  ['Iluminación', 'la lamparita del cuarto'],
  ['Catering', 'lo que había en la heladera'],
  ['Efectos especiales', 'MS Paint'],
  ['Departamento legal', 'ojalá no haga falta'],
];

/** Cierre del stream: créditos rodando sobre la escena low-poly. */
export function Outro() {
  const texts = useOverlayStore((s) => s.texts);
  // Un adjetivo por miembro por pasada de créditos.
  const adjetivos = useMemo(
    () => Object.fromEntries(MEMBER_IDS.map((id) => [id, randomAdjetivo(id)])),
    [],
  );

  return (
    <motion.div
      className="layout-root outro scanlines"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, transition: CORTE_BRUSCO }}
    >
      <LowPolyScene />

      <div className="outro__roll-wrap">
        <div className="outro__roll">
          <h1 className="outro__titulo chroma-text">{texts['outro-titulo']}</h1>
          <p className="outro__subtitulo">{texts['outro-sub']}</p>

          {/* UN solo Canvas para los 5 bustos (regla AvatarRow/AvatarColumn):
              antes eran 5 AvatarBust = 5 contextos WebGL y el navegador
              empezaba a descartar contextos. La celda queda como placeholder
              de alineación. */}
          <div className="outro__creditos">
            <AvatarColumn
              members={[...MEMBER_IDS]}
              rowHeight={CREDIT_ROW_PX}
              avatarCenter={CREDIT_AVATAR_CENTER_PX}
              avatarSize={CREDIT_AVATAR_PX}
            />
            {MEMBER_IDS.map((id) => (
              <div key={id} className="outro__credito">
                <div className="outro__credito-avatar" />
                <span className="outro__credito-nombre" style={{ color: MEMBERS[id].color }}>
                  {/* Carita: hija estática dentro del roll animado — el filtro
                      .sticker va acá y no en el wrapper que se mueve. */}
                  <Carita member={id} size={46} className="outro__credito-carita sticker" />
                  {getMemberName(texts, id)}
                </span>
                <span className="outro__credito-rol">“{adjetivos[id]}”</span>
              </div>
            ))}
          </div>

          {CREDITOS_EXTRA.map(([rol, quien]) => (
            <div key={rol} className="outro__credito outro__credito--extra">
              <span className="outro__credito-rol">{rol}</span>
              <span className="outro__credito-nombre">{quien}</span>
            </div>
          ))}

          <p className="outro__slogan">{texts.eslogan}</p>
          <motion.h2
            className="outro__gracias"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: -3, transition: { ...SPRING_TORPE, delay: 0.5 } }}
          >
            {texts['outro-gracias']}
          </motion.h2>
        </div>
      </div>

      <div className="outro__marquee-wrap">
        <MarqueeText text={texts['outro-marquee']} className="outro__marquee" />
      </div>
    </motion.div>
  );
}
