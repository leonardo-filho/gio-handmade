"use client";

// Cena 3D do hero "Ponto a ponto": as miçangas do Top Maya, uma malha
// instanciada por tipo (pérola dourada, cristal âmbar, pérola marrom), três
// chamadas de desenho no total. O trabalho de cada quadro fica no MotorCena
// (motor3d.ts); aqui só se ligam as pontas com o React Three Fiber.
//
// Só desenha quando pedem (frameloop "demand"): a página escreve a rolagem e
// o ponteiro na ponte e chama pedir(); a cena continua pedindo quadros
// sozinha enquanto algo se mexe (a deriva das miçangas soltas, a 30 quadros
// por segundo, e só por alguns segundos depois do último gesto) e para quando
// tudo assenta ou o hero sai da tela.
//
// Este arquivo só é baixado na home, por import dinâmico, e só quando o
// aparelho tem WebGL e a pessoa não pediu movimento reduzido.

import { use, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { carregarMicangas, type Micangas } from "./micangas";
import { DISTANCIA, FOV, MotorCena } from "./motor3d";
import { ligarPedido, type Ponte } from "./ponte";

type Props = { ponte: Ponte; compacto: boolean; aoFicarPronta: () => void };

export default function Cena({ ponte, compacto, aoFicarPronta }: Props) {
  const dados = use(carregarMicangas());
  return (
    <Canvas
      shadows="variance"
      frameloop="demand"
      dpr={[1, compacto ? 1.75 : 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: FOV, near: 0.02, far: 60, position: [0, 0, DISTANCIA] }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 0.96;
      }}
    >
      <Conteudo dados={dados} ponte={ponte} compacto={compacto} aoFicarPronta={aoFicarPronta} />
    </Canvas>
  );
}

function Conteudo({ dados, ponte, compacto, aoFicarPronta }: { dados: Micangas } & Props) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  const [motor] = useState(() => new MotorCena(dados, compacto));

  useEffect(() => () => motor.dispose(), [motor]);
  useEffect(() => {
    const desligar = motor.ligarEstudio(gl, scene);
    invalidate();
    return desligar;
  }, [motor, gl, scene, invalidate]);
  useEffect(() => {
    const desligar = ligarPedido(ponte, () => invalidate());
    invalidate();
    return desligar;
  }, [ponte, invalidate]);

  useFrame((estado) => {
    const ritmo = motor.quadro(estado.gl, estado.camera as THREE.PerspectiveCamera, estado.size.width, estado.size.height, ponte);
    // Depois que o primeiro quadro chegou à tela, a página tira a foto.
    if (motor.primeiroQuadro()) requestAnimationFrame(() => aoFicarPronta());
    if (!ponte.visivel) return;
    if (ritmo === "animando") estado.invalidate();
    else if (ritmo === "deriva") motor.depois(() => estado.invalidate());
  });

  return (
    <>
      {/* Névoa creme: as miçangas do fundo somem no papel, dando profundidade. */}
      <fog attach="fog" args={["#EDE7D9", DISTANCIA + 1.2, DISTANCIA + 17]} />
      <hemisphereLight args={["#fff7ea", "#5c4a3a", 0.55]} />
      <directionalLight position={[5, -1, 3]} intensity={0.45} color="#ffe6c4" />
      <primitive object={motor.luz} />
      <primitive object={motor.luz.target} />
      <primitive object={motor.fundo} />
      <primitive object={motor.grupo} />
    </>
  );
}
