import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { PaperWrapper } from "./PaperWrapper";
import {
  PaperCutout,
  HeadlineText,
  RansomText,
  MarkerHighlight,
  TypewriterText,
  RedactionText,
  StampMark,
  AnnotationArrow,
  MarkerCircle,
  PaperTransition,
  DossierHeader,
  PolaroidPhoto,
  PaperCutoutImage,
  StickyNote,
  HazardStrip,
  EvidenceTag,
} from "./Components";

/* ═══════════════════════════════════════════════════════════════
   SCENE 01 (0:00–0:02) — 120 frames
   "Assalamu'alaikum Warahmatullahi Wabarakatuh"
   ═══════════════════════════════════════════════════════════════ */
export const Scene01: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="PEMBUKAAN // SERUAN TAUHID" exhibitNumber="EXHIBIT #01">
    <PaperTransition type="rip" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "110px 40px 90px" }}>
      <DossierHeader tag="KLIPING KHUSUS" code="MUKADIMAH // 01" delay={4} />

      {/* Hero Stack with layered backing card */}
      <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Layer 1: Tilted Kraft Backing Card */}
        <PaperCutout delay={6} rotation={-4} isKraft width={840} padding="20px" seed="s01kraft" style={{ position: "absolute", zIndex: 1 }}>
          <div style={{ height: 260 }} />
        </PaperCutout>

        {/* Layer 2: Main Headline Card */}
        <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <PaperCutout delay={10} rotation={1} width={820} padding="36px 60px" hasTape playSound seed="s01a">
            <HeadlineText text="Assalamu'alaikum" delay={16} fontSize={80} />
          </PaperCutout>

          <PaperCutout delay={22} rotation={-1.5} bgColor="#FFE600" padding="16px 44px" hasCornerTapes seed="s01b">
            <TypewriterText text="Warahmatullahi Wabarakatuh" delay={30} fontSize={34} />
          </PaperCutout>
        </div>
      </div>

      <StickyNote
        text="Membuka kajian risalah dengan salam kedamaian dan seruan tauhid murni."
        delay={34}
        rotation={-2}
        color="#FFF9A6"
        seed="s01note"
        width={580}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <EvidenceTag label="TRANSKRIP RESMI" sub="VERIFIKASI SERUAN" delay={38} rotation={-3} />
        <StampMark text="MULAI" delay={44} size={180} color="#1D3557" rotation={8} subText="EDITORIAL 2026" />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════════════════════
   SCENE 02 (0:02–0:05) — 180 frames
   "Pesan mimpi dari Muhammad Qasim bin Abdul Karim..."
   ═══════════════════════════════════════════════════════════════ */
export const Scene02: React.FC = () => (
  <PaperWrapper theme="B_DeepInk" archiveTag="SUBJEK INVESTIGASI // KLAIM MIMPI" exhibitNumber="EXHIBIT #02">
    <PaperTransition type="slam" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "110px 40px 90px" }}>
      <DossierHeader tag="PROFIL TOKOH" code="PAKISTAN // MQ-01" delay={4} bgColor="#1D3557" />

      {/* Hero: Large Polaroid + Title Stack */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: "100%" }}>
        <MarkerCircle delay={26} color="#E63946">
          <PolaroidPhoto
            src={staticFile("videomq-5/foto/mq_cutout.png")}
            caption="MUHAMMAD QASIM (LAHIR 1976)"
            delay={8}
            rotation={2.5}
            width={430}
            hasPaperclip
            playSound
            seed="s02p"
          />
        </MarkerCircle>

        <PaperCutout delay={28} rotation={-2} bgColor="#F4EBD9" padding="22px 52px" hasTape seed="s02txt" width={760}>
          <HeadlineText text="Pesan Mimpi" delay={36} fontSize={62} />
        </PaperCutout>

        <PaperCutout delay={42} rotation={1.5} bgColor="#1D3557" padding="16px 40px" hasCornerTapes seed="s02sub">
          <TypewriterText text="Muhammad Qasim bin Abdul Karim" delay={50} fontSize={28} color="#F4EBD9" />
        </PaperCutout>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Mengklaim menerima ratusan mimpi tentang masa depan & seruan tauhid."
          delay={52}
          rotation={-2}
          color="#FFF9A6"
          seed="s02note"
          width={520}
        />
        <EvidenceTag label="SUBJEK KAJIAN" sub="ARSIP DOKUMEN" delay={58} rotation={4} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════════════════════
   SCENE 03 (0:05–0:07) — 120 frames
   "Yang paling ditekankan..."
   ═══════════════════════════════════════════════════════════════ */
export const Scene03: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="ANALISIS KUNCI // INTI PESAN" exhibitNumber="EXHIBIT #03">
    <PaperTransition type="rip" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "110px 40px 90px" }}>
      <DossierHeader tag="POIN UTAMA" code="FOKUS // #01" delay={4} />

      {/* Layered stack */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <PaperCutout delay={6} rotation={-2} isKraft width={780} padding="24px 56px" hasTape seed="s03a">
          <HeadlineText text="Yang Paling" delay={12} fontSize={70} />
        </PaperCutout>

        <AnnotationArrow direction="down" delay={20} color="#E63946" size={88} />

        <PaperCutout delay={18} rotation={2.5} bgColor="#FAF8F2" width={820} padding="26px 54px" hasCornerTapes playSound seed="s03b">
          <MarkerHighlight text="DITEKANKAN!" delay={26} fontSize={90} color="#E63946" />
        </PaperCutout>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Fokus sentral: bukan politik atau ramalan, melainkan kemurnian tauhid."
          delay={32}
          rotation={-2}
          color="#FFF9A6"
          seed="s03note"
          width={500}
        />
        <StampMark text="PRIORITAS" delay={38} size={180} color="#E63946" rotation={-12} subText="INTI SERUAN" />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════════════════════
   SCENE 04 (0:07–0:10) — 180 frames
   "Pentingnya menjaga diri dari syirik dan segala bentuknya..."
   ═══════════════════════════════════════════════════════════════ */
export const Scene04: React.FC = () => (
  <PaperWrapper theme="B_DeepInk" archiveTag="PERINGATAN AKIDAH // LARANGAN UTAMA" exhibitNumber="EXHIBIT #04">
    <PaperTransition type="slam" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <HazardStrip text="PERINGATAN KERAS // JAUHI SYIRIK // BATALKAN!" delay={4} rotation={-2} width={880} />

      {/* Hero Collage: Idol Cutout with Paper-Cut Stroke + Ransom Typography */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, width: "100%", maxWidth: 940 }}>
        <PaperCutoutImage
          src={staticFile("videomq-6/foto/berhala_wanita_papercut.png")}
          caption="BERHALA // SYIRIK"
          delay={8}
          rotation={-3}
          width={290}
          hasCornerTapes
          seed="s04idol"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-start", flex: 1 }}>
          <PaperCutout delay={14} rotation={2} bgColor="#E63946" padding="28px 44px" hasTape seed="s04a">
            <RansomText text="JAUHI SYIRIK" delay={20} fontSize={62} />
          </PaperCutout>

          <PaperCutout delay={26} rotation={-1.5} bgColor="#F4EBD9" padding="16px 36px" hasPaperclip seed="s04b">
            <TypewriterText text="Dan Segala Bentuknya..." delay={32} fontSize={28} />
          </PaperCutout>

          <StampMark text="BAHAYA BESAR" delay={40} size={180} color="#FFE600" rotation={-12} subText="AWAS SYIRIK" />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Syirik menghapus seluruh amal kebajikan dan memutus pertolongan Ilahi."
          delay={46}
          rotation={2}
          color="#FFC1C8"
          seed="s04note"
          width={520}
        />
        <EvidenceTag label="STATUS BAHAYA" sub="DOSA TERBESAR" delay={52} rotation={-3} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════════════════════
   SCENE 05 (0:10–0:13) — 180 frames
   "...dan kembali kepada tauhid yang murni."
   ═══════════════════════════════════════════════════════════════ */
export const Scene05: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="PRINSIP PEMURNIAN // TAUHID MURNI" exhibitNumber="EXHIBIT #05">
    <PaperTransition type="slide" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <DossierHeader tag="SOLUSI AKIDAH" code="TAUHID // MURNI" delay={4} bgColor="#1D3557" />

      {/* Hero Collage: Tauhid Finger Cutout with Paper-Cut Stroke + Bold Typography */}
      <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 36, width: "100%", maxWidth: 940 }}>
        <PaperCutoutImage
          src={staticFile("videomq-6/foto/telunjuk_tauhid_papercut.png")}
          caption="ISYARAT TAUHID"
          delay={8}
          rotation={3}
          width={280}
          hasTape
          seed="s05finger"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-end", flex: 1 }}>
          <PaperCutout delay={12} rotation={-2} width={500} padding="22px 42px" hasPaperclip seed="s05a">
            <HeadlineText text="Kembali Kepada" delay={18} fontSize={56} />
          </PaperCutout>

          <PaperCutout delay={22} rotation={1.5} bgColor="#1D3557" width={560} padding="26px 46px" hasCornerTapes seed="s05b">
            <MarkerHighlight text="TAUHID MURNI" delay={28} fontSize={68} color="#FFE600" textColor="#F4EBD9" />
          </PaperCutout>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <EvidenceTag label="LAA ILAHA ILLALLAH" sub="PRINSIP ASASI" delay={36} rotation={-3} />
        <StickyNote
          text="Hanya bergantung dan berserah diri secara utuh kepada Allah semata."
          delay={42}
          rotation={2}
          color="#D4EDDA"
          seed="s05note"
          width={450}
        />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════════════════════
   SCENE 06 (0:13–0:16) — 180 frames
   "Muhammad Qasim menjelaskan..."
   ═══════════════════════════════════════════════════════════════ */
export const Scene06: React.FC = () => (
  <PaperWrapper theme="B_DeepInk" archiveTag="KLARIFIKASI NARASI // DETAIL KAJIAN" exhibitNumber="EXHIBIT #06">
    <PaperTransition type="rip" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "110px 40px 90px" }}>
      <DossierHeader tag="PENJELASAN KHUSUS" code="MQ-SERIES // 06" delay={4} />

      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, width: "100%" }}>
        <PolaroidPhoto
          src={staticFile("videomq-5/foto/mq_cutout.png")}
          caption="NARATOR"
          delay={8}
          rotation={-3}
          width={360}
          hasCornerTapes
          seed="s06p"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 460 }}>
          <PaperCutout delay={20} rotation={2} bgColor="#F4EBD9" padding="26px 36px" hasPaperclip seed="s06t">
            <HeadlineText text="MENJELASKAN" delay={28} fontSize={50} color="#161D27" />
          </PaperCutout>
          <StickyNote
            text="Bahwa tauhid bukan sebatas teori, melainkan tindakan nyata sehari-hari."
            delay={36}
            rotation={-2}
            color="#FFF9A6"
            seed="s06note"
            width={400}
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <EvidenceTag label="DOKUMENTASI RIIL" sub="VERIFIKASI SITUS" delay={42} rotation={4} />
        <StampMark text="VERIFIED" delay={48} size={170} color="#FFE600" rotation={-8} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════════════════════
   SCENE 07 (0:16–0:18) — 120 frames
   "...bahwa tauhid bukan hanya diucapkan melalui lisan..."
   ═══════════════════════════════════════════════════════════════ */
export const Scene07: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="EVALUASI UCAPAN // BUKTI TUNTUTAN" exhibitNumber="EXHIBIT #07">
    <PaperTransition type="slam" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <DossierHeader tag="KRITIK POLA PIKIR" code="LISAN VS AMAL" delay={4} />

      {/* Hero Collage: Speaking Child Cutout with Paper-Cut Stroke + Critique typography */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, width: "100%", maxWidth: 940 }}>
        <PaperCutoutImage
          src={staticFile("videomq-6/foto/lisan_anak_papercut.png")}
          caption="LISAN SEMATA"
          delay={8}
          rotation={-2}
          width={330}
          hasCornerTapes
          seed="s07child"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start", flex: 1 }}>
          <PaperCutout delay={14} rotation={2} padding="20px 38px" hasTape seed="s07a">
            <MarkerHighlight text="Bukan Sekadar" delay={20} fontSize={50} color="#E63946" />
          </PaperCutout>

          <PaperCutout delay={22} rotation={-2} bgColor="#161D27" padding="22px 42px" hasPaperclip seed="s07b">
            <RedactionText text="Ucapan Lisan" delay={28} fontSize={52} />
          </PaperCutout>

          <StampMark text="BUKAN LISAN" delay={36} size={170} color="#E63946" rotation={8} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Mengaku bertauhid di lisan tidak bermakna bila perbuatan bertolak belakang."
          delay={38}
          rotation={-2}
          color="#FFF9A6"
          seed="s07note"
          width={490}
        />
        <EvidenceTag label="TUNTUTAN PEMBUKTIAN" sub="BUKAN UCAPAN" delay={44} rotation={3} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════════════════════
   SCENE 08 (0:18–0:20) — 120 frames
   "...tetapi harus dibuktikan melalui tindakan."
   ═══════════════════════════════════════════════════════════════ */
export const Scene08: React.FC = () => (
  <PaperWrapper theme="B_DeepInk" archiveTag="TUNTUTAN TINDAKAN // AKSI NYATA" exhibitNumber="EXHIBIT #08">
    <PaperTransition type="slide" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <DossierHeader tag="AKSI NYATA" code="INTEGRITAS // AMAL" delay={4} bgColor="#FFE600" textColor="#161D27" />

      {/* Hero Collage: Idol Destroyed Cutout with Paper-Cut Stroke + Action Typography */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, width: "100%", maxWidth: 940 }}>
        <PaperCutoutImage
          src={staticFile("videomq-6/foto/berhala_hancur_papercut.png")}
          caption="HANCURKAN BERHALA"
          delay={8}
          rotation={-3}
          width={340}
          hasCornerTapes
          seed="s08idol"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start", flex: 1 }}>
          <PaperCutout delay={14} rotation={2} bgColor="#FFE600" padding="24px 42px" hasTape seed="s08a">
            <RansomText text="BUKTIKAN" delay={20} fontSize={60} />
          </PaperCutout>

          <PaperCutout delay={24} rotation={-1.5} bgColor="#FAF8F2" padding="18px 38px" hasPaperclip seed="s08b">
            <HeadlineText text="Melalui Tindakan" delay={30} fontSize={46} color="#161D27" />
          </PaperCutout>

          <StampMark text="AKSI NYATA" delay={38} size={170} color="#FFE600" rotation={8} subText="BUKTI IMAN" />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <EvidenceTag label="BUKTI RIIL" sub="AMAL SEHARI-HARI" delay={42} rotation={4} />
        <StickyNote
          text="Tauhid bukan teori pasif, melainkan perombakan nyata dalam kebiasaan hidup."
          delay={48}
          rotation={-2}
          color="#FFF9A6"
          seed="s08note"
          width={520}
        />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════════════════════
   SCENE 09 (0:20–0:24) — 240 frames
   "Umat Islam perlu berusaha..."
   ═══════════════════════════════════════════════════════════════ */
export const Scene09: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="SERUAN KOLEKTIF // UMAT ISLAM" exhibitNumber="EXHIBIT #09">
    <PaperTransition type="rip" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <DossierHeader tag="SERUAN UMUM" code="UMAT // GLOBAL" delay={4} />

      {/* Hero: Umat Islam Photo Cutout with Paper-Cut Stroke */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, width: "100%", maxWidth: 940 }}>
        <PaperCutoutImage
          src={staticFile("videomq-6/foto/umat_islam_papercut.png")}
          caption="IKHTIAR UMAT ISLAM"
          delay={8}
          rotation={-2}
          width={350}
          hasCornerTapes
          seed="s09umat"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start", flex: 1 }}>
          <PaperCutout delay={18} rotation={2} width={440} padding="22px 40px" hasPaperclip seed="s09a">
            <HeadlineText text="Umat Islam" delay={26} fontSize={60} />
          </PaperCutout>

          <PaperCutout delay={32} rotation={-1.5} bgColor="#1D3557" width={440} padding="20px 38px" hasTape seed="s09b">
            <MarkerHighlight text="Perlu Berusaha" delay={40} fontSize={50} color="#FFE600" textColor="#F4EBD9" />
          </PaperCutout>

          <StampMark text="IKHTIAR" delay={46} size={160} color="#1D3557" rotation={-6} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Tidak menunggu pasif, tetapi aktif mengevaluasi kebiasaan hidup."
          delay={48}
          rotation={2}
          color="#FFF9A6"
          seed="s09note"
          width={520}
        />
        <EvidenceTag label="IKHTIAR KOLEKTIF" sub="BANGKITKAN AKIDAH" delay={54} rotation={-4} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════════════════════
   SCENE 10 (0:24–0:26) — 120 frames
   "...membersihkan kehidupan mereka..."
   ═══════════════════════════════════════════════════════════════ */
export const Scene10: React.FC = () => (
  <PaperWrapper theme="B_DeepInk" archiveTag="PROSES PURIFIKASI // BERSIHKAN DIRI" exhibitNumber="EXHIBIT #10">
    <PaperTransition type="slam" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "110px 40px 90px" }}>
      <HazardStrip text="PURIFIKASI TOTAL // BERSIHKAN KEHIDUPAN // EVALUASI" delay={4} rotation={-1.5} width={880} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <PaperCutout delay={8} rotation={-2} bgColor="#E63946" width={820} padding="34px 58px" hasCornerTapes seed="s10a">
          <RansomText text="BERSIHKAN" delay={16} fontSize={86} />
        </PaperCutout>

        <PaperCutout delay={22} rotation={2} bgColor="#F4EBD9" width={720} padding="18px 40px" hasTape seed="s10b">
          <TypewriterText text="Kehidupan Mereka..." delay={30} fontSize={36} />
        </PaperCutout>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <EvidenceTag label="TAZKIYATUN NAFS" sub="PEMBERSIHAN" delay={36} rotation={-3} />
        <StampMark text="SUCIKAN" delay={42} size={180} color="#1D3557" rotation={10} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════════════════════
   SCENE 11 (0:26–0:28) — 120 frames
   "...dari berbagai bentuk kesyirikan."
   ═══════════════════════════════════════════════════════════════ */
export const Scene11: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="KLASIFIKASI SYIRIK // JAUHI SEMUA" exhibitNumber="EXHIBIT #11">
    <PaperTransition type="rip" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "110px 40px 90px" }}>
      <DossierHeader tag="KLASIFIKASI BAHAYA" code="SYIRIK // TOTAL" delay={4} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <PaperCutout delay={8} rotation={2} width={760} padding="22px 48px" hasTape seed="s11a">
          <MarkerHighlight text="Berbagai Bentuk" delay={14} fontSize={58} color="#FFE600" />
        </PaperCutout>

        <PaperCutout delay={18} rotation={-3} bgColor="#161D27" width={840} padding="28px 56px" hasCornerTapes seed="s11b">
          <HeadlineText text="Kesyirikan" delay={26} fontSize={80} color="#E63946" />
        </PaperCutout>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Syirik nyata, syirik samar, dan ketergantungan hati selain kepada Allah."
          delay={32}
          rotation={-2}
          color="#FFC1C8"
          seed="s11note"
          width={490}
        />
        <StampMark text="BATALKAN!" delay={38} size={180} color="#E63946" rotation={-14} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════════════════════
   SCENE 12 (0:28–0:31) — 180 frames
   "Salah satu pesan berulang..."
   ═══════════════════════════════════════════════════════════════ */
export const Scene12: React.FC = () => (
  <PaperWrapper theme="B_DeepInk" archiveTag="KONSISTENSI NARASI // DOKUMENTASI" exhibitNumber="EXHIBIT #12">
    <PaperTransition type="slide" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "110px 40px 90px" }}>
      <DossierHeader tag="POIN REPETISI" code="REITERASI // #01" delay={4} bgColor="#1D3557" />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <PaperCutout delay={8} rotation={-1.5} bgColor="#F4EBD9" width={780} padding="30px 52px" hasPaperclip seed="s12a">
          <TypewriterText text="[PESAN BERULANG KALI]" delay={16} fontSize={48} />
        </PaperCutout>

        <StampMark text="BERULANG" delay={28} size={210} color="#E63946" rotation={-10} subText="INTI PESAN" />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Repetisi pesan menunjukkan urgensi genting pemurnian aqidah."
          delay={38}
          rotation={3}
          color="#FFF9A6"
          seed="s12note"
          width={520}
        />
        <EvidenceTag label="ARSIP MIMPI" sub="SERI DOKUMEN" delay={44} rotation={-4} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════════════════════
   SCENE 13 (0:31–0:33) — 120 frames
   "...dalam penjelasan Muhammad Qasim..."
   ═══════════════════════════════════════════════════════════════ */
export const Scene13: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="RUJUKAN PESAN // PENJELASAN" exhibitNumber="EXHIBIT #13">
    <PaperTransition type="rip" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "110px 40px 90px" }}>
      <DossierHeader tag="REFERENSI PENJELASAN" code="MQ // TRANSCRIPT" delay={4} />

      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, width: "100%" }}>
        <PolaroidPhoto
          src={staticFile("videomq-5/foto/mq_cutout.png")}
          caption="MUHAMMAD QASIM"
          delay={8}
          rotation={3}
          width={360}
          hasTape
          seed="s13photo"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <AnnotationArrow direction="right" delay={18} color="#1D3557" size={72} />
          <PaperCutout delay={22} rotation={-2} bgColor="#FFE600" width={420} padding="18px 34px" seed="s13t">
            <HeadlineText text="Penjelasan" delay={28} fontSize={48} />
          </PaperCutout>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <EvidenceTag label="ARSIP MIMPI" sub="DOKUMEN RESMI" delay={34} rotation={-3} />
        <StickyNote
          text="Penjelasan tercatat dalam risalah dan rekaman video penuturannya."
          delay={40}
          rotation={2}
          color="#FFF9A6"
          seed="s13note"
          width={450}
        />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════════════════════
   SCENE 14 (0:33–0:36) — 180 frames
   "...selama belum menjaga diri dari syirik..."
   ═══════════════════════════════════════════════════════════════ */
export const Scene14: React.FC = () => (
  <PaperWrapper theme="B_DeepInk" archiveTag="SYARAT MUTLAK // PERINGATAN" exhibitNumber="EXHIBIT #14">
    <PaperTransition type="slam" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <HazardStrip text="KONDISI FATAL // JIKA BELUM MENJAGA DIRI // AWAS!" delay={4} rotation={-2} width={880} />

      {/* Hero: Ransel Syirik Cutout with Paper-Cut Stroke */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, width: "100%", maxWidth: 940 }}>
        <PaperCutoutImage
          src={staticFile("videomq-6/foto/ransel_syirik_papercut.png")}
          caption="BEBAN SYIRIK"
          delay={8}
          rotation={-3}
          width={310}
          hasTape
          seed="s14ransel"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start", flex: 1 }}>
          <PaperCutout delay={14} rotation={2} width={500} padding="22px 38px" hasPaperclip seed="s14a">
            <RansomText text="BELUM MENJAGA DIRI" delay={20} fontSize={44} />
          </PaperCutout>

          <PaperCutout delay={22} rotation={-2} bgColor="#E63946" width={500} padding="20px 38px" hasCornerTapes seed="s14b">
            <HeadlineText text="Dari Syirik" delay={28} fontSize={56} color="#FAF8F2" />
          </PaperCutout>

          <StampMark text="TERHALANG" delay={36} size={170} color="#FFE600" rotation={8} subText="FATAL" />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Syarat terkabulnya doa & pertolongan adalah bebas dari syirik."
          delay={40}
          rotation={2}
          color="#FFC1C8"
          seed="s14note"
          width={500}
        />
        <EvidenceTag label="KONDISI FATAL" sub="PENGHALANG DOA" delay={46} rotation={-3} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════════════════════
   SCENE 15 (0:36–0:39) — 180 frames
   "...maka pertolongan Allah tidak akan datang."
   ═══════════════════════════════════════════════════════════════ */
export const Scene15: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="KONSEKUENSI TEOLOGIS // HUKUM SUNNATULLAH" exhibitNumber="EXHIBIT #15">
    <PaperTransition type="rip" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "110px 40px 90px" }}>
      <DossierHeader tag="KONSEKUENSI BERAT" code="TERHALANG // 15" delay={4} bgColor="#161D27" />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <PaperCutout delay={8} rotation={-1.5} bgColor="#E63946" width={840} padding="36px 60px" hasCornerTapes seed="s15a">
          <HeadlineText text="Pertolongan Allah" delay={16} fontSize={74} color="#FAF8F2" />
        </PaperCutout>

        <StampMark text="TIDAK DATANG" delay={26} size={230} color="#161D27" rotation={-12} subText="TERHALANG" />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Pintu kemenangan tertutup rapat jika umat masih mempersekutukan Allah."
          delay={36}
          rotation={-2}
          color="#FFF9A6"
          seed="s15note"
          width={490}
        />
        <EvidenceTag label="HUKUM PASTI" sub="DALIL TEOLOGIS" delay={42} rotation={4} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);
