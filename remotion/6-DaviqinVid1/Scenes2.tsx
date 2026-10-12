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
  PaperTransition,
  DossierHeader,
  PolaroidPhoto,
  PaperCutoutImage,
  StickyNote,
  HazardStrip,
  EvidenceTag,
} from "./Components";

/* ═══════════════════════════════════════════════
   SCENE 16 (0:39–0:42) — 180 frames
   "Sebaliknya, ketika berusaha melindungi diri..."
   ═══════════════════════════════════════════════ */
export const Scene16: React.FC = () => (
  <PaperWrapper theme="B_DeepInk" archiveTag="SOLUSI ALTERNATIF // PERLINDUNGAN" exhibitNumber="EXHIBIT #16">
    <PaperTransition type="slide" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "110px 40px 90px" }}>
      <DossierHeader tag="LANGKAH AKTIF" code="PROTEKSI // DIRI" delay={4} bgColor="#FFE600" textColor="#161D27" />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <PaperCutout delay={8} rotation={2} bgColor="#F4EBD9" width={800} padding="30px 56px" hasTape seed="s16a">
          <HeadlineText text="Sebaliknya..." delay={16} fontSize={78} />
        </PaperCutout>

        <AnnotationArrow direction="down" delay={26} color="#FFE600" size={84} />

        <PaperCutout delay={22} rotation={-1.5} bgColor="#1D3557" width={840} padding="24px 50px" hasCornerTapes seed="s16b">
          <MarkerHighlight text="Melindungi Diri" delay={30} fontSize={64} color="#FFE600" textColor="#F4EBD9" />
        </PaperCutout>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Berikhtiar sungguh-sungguh membentengi tauhid keluarga dan lingkungan."
          delay={38}
          rotation={-2}
          color="#FFF9A6"
          seed="s16note"
          width={490}
        />
        <EvidenceTag label="PERLINDUNGAN" sub="UPAYA MAKSIMAL" delay={44} rotation={3} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 17 (0:42–0:44) — 120 frames
   "...dari semua bentuk kesyirikan..."
   ═══════════════════════════════════════════════ */
export const Scene17: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="BATALKAN SEMUA // TANPA KOMPROMI" exhibitNumber="EXHIBIT #17">
    <PaperTransition type="rip" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <HazardStrip text="ELIMINASI TOTAL // TANPA KOMPROMI // TOLAK SYIRIK" delay={4} rotation={-1.5} width={880} />

      {/* Hero: Tolak Berhala Cutout with Paper-Cut Stroke */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, width: "100%", maxWidth: 940 }}>
        <PaperCutoutImage
          src={staticFile("videomq-6/foto/nolak_berhala_papercut.png")}
          caption="TOLAK BERHALA"
          delay={8}
          rotation={-2}
          width={340}
          hasCornerTapes
          seed="s17nolak"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start", flex: 1 }}>
          <PaperCutout delay={14} rotation={2} bgColor="#161D27" padding="22px 38px" hasTape seed="s17a">
            <RansomText text="JAUHI SYIRIK" delay={20} fontSize={50} />
          </PaperCutout>

          <PaperCutout delay={22} rotation={-1.5} bgColor="#E63946" padding="18px 36px" hasPaperclip seed="s17b">
            <HeadlineText text="Semua Bentuknya" delay={28} fontSize={44} color="#FAF8F2" />
          </PaperCutout>

          <StampMark text="LINDUNGI!" delay={34} size={170} color="#E63946" rotation={8} subText="WAJIB" />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Tak ada celah bagi keyakinan palsu, jimat, ramalan, atau syirik modern."
          delay={38}
          rotation={2}
          color="#FFC1C8"
          seed="s17note"
          width={500}
        />
        <EvidenceTag label="PENOLAKAN TOTAL" sub="AQIDAH MURNI" delay={44} rotation={-3} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 18 (0:44–0:46) — 120 frames
   "...dan memurnikan tauhid..."
   ═══════════════════════════════════════════════ */
export const Scene18: React.FC = () => (
  <PaperWrapper theme="B_DeepInk" archiveTag="PEMURNIAN AKIDAH // INTI AJARAN" exhibitNumber="EXHIBIT #18">
    <PaperTransition type="slam" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <DossierHeader tag="KUNCI UTAMA" code="IKHLAS // 18" delay={4} bgColor="#1D3557" />

      {/* Hero: Agree Tauhid Cutout with Paper-Cut Stroke */}
      <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 32, width: "100%", maxWidth: 940 }}>
        <PaperCutoutImage
          src={staticFile("videomq-6/foto/agree_tauhid_papercut.png")}
          caption="TAUHID MURNI"
          delay={8}
          rotation={3}
          width={350}
          hasCornerTapes
          seed="s18agree"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-end", flex: 1 }}>
          <PaperCutout delay={14} rotation={-2} width={500} padding="22px 38px" hasPaperclip seed="s18a">
            <MarkerHighlight text="Memurnikan" delay={20} fontSize={56} color="#FFE600" textColor="#161D27" />
          </PaperCutout>

          <PaperCutout delay={22} rotation={2} bgColor="#FFE600" width={520} padding="24px 42px" hasTape seed="s18b">
            <HeadlineText text="Tauhid Sejati" delay={28} fontSize={64} color="#161D27" />
          </PaperCutout>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Mengesakan Allah dalam rububiyah, uluhiyah, dan asma' wa shifat."
          delay={34}
          rotation={-2}
          color="#D4EDDA"
          seed="s18note"
          width={490}
        />
        <StampMark text="MURNI" delay={40} size={170} color="#FFE600" rotation={-8} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 19 (0:46–0:48) — 120 frames
   "...maka pertolongan dan rahmat Allah akan datang."
   ═══════════════════════════════════════════════ */
export const Scene19: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="JANJI ALLAH // KEMENANGAN" exhibitNumber="EXHIBIT #19">
    <PaperTransition type="slide" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "110px 40px 90px" }}>
      <DossierHeader tag="JANJI ILAHI" code="RAHMAT // PERTOLONGAN" delay={4} bgColor="#1D3557" />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <PaperCutout delay={8} rotation={2.5} bgColor="#1D3557" width={840} padding="34px 62px" hasTape seed="s19a">
          <HeadlineText text="Rahmat Allah" delay={16} fontSize={76} color="#FFE600" />
        </PaperCutout>

        <PaperCutout delay={22} rotation={-1.5} bgColor="#FFE600" width={780} padding="18px 42px" hasCornerTapes seed="s19b">
          <RansomText text="AKAN DATANG!" delay={28} fontSize={58} />
        </PaperCutout>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <EvidenceTag label="PERTOLONGAN NYATA" sub="JANJI PASTI" delay={34} rotation={-4} />
        <StickyNote
          text="Pertolongan Allah begitu dekat bagi mereka yang ikhlas bertauhid."
          delay={40}
          rotation={2}
          color="#FFF9A6"
          seed="s19note"
          width={460}
        />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 20 (0:48–0:52) — 240 frames
   "Syirik dalam penjelasan situs website Muhammad Qasim..."
   ═══════════════════════════════════════════════════════════════ */
export const Scene20: React.FC = () => (
  <PaperWrapper theme="B_DeepInk" archiveTag="ARSIP DIGITAL // SITUS WEB RESMI" exhibitNumber="EXHIBIT #20">
    <PaperTransition type="rip" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "110px 40px 90px" }}>
      <DossierHeader tag="SUMBER DOKUMEN" code="WEB // DOKUMENTASI" delay={4} bgColor="#161D27" />

      {/* Browser Card Stack */}
      <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Tilted Kraft backing folder */}
        <PaperCutout delay={6} rotation={-3.5} isKraft width={880} padding="20px" seed="s20bg" style={{ position: "absolute", zIndex: 1 }}>
          <div style={{ height: 380 }} />
        </PaperCutout>

        <PaperCutout delay={10} rotation={0.5} bgColor="#FAF8F2" padding="0" width={860} hasPaperclip seed="s20mock" style={{ zIndex: 5 }}>
          <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
            <div
              style={{
                padding: "14px 24px",
                background: "#EAE2D2",
                borderBottom: "2px solid #D5C8B4",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", gap: 7 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#E63946" }} />
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#FFE600" }} />
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#2A9D8F" }} />
              </div>
              <div
                style={{
                  background: "#FAF8F2",
                  padding: "8px 22px",
                  borderRadius: 4,
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 20,
                  color: "#1D3557",
                  fontWeight: 700,
                  flex: 1,
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                🔒 https://muhammadqasimpk.org/syirik
              </div>
            </div>

            <div style={{ padding: "32px 38px", display: "flex", flexDirection: "column", gap: 16 }}>
              <HeadlineText text="Penjelasan Syirik" delay={20} fontSize={54} color="#161D27" />
              <TypewriterText text="Bukan hanya penyembahan berhala semata..." delay={32} fontSize={28} />
              <div style={{ height: 2, background: "#D5C8B4", margin: "10px 0" }} />
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 18, color: "#555" }}>
                ARUS DOKUMEN: Risalah Penjelasan Aqidah & Larangan Ketergantungan Makhluq.
              </div>
            </div>
          </div>
        </PaperCutout>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Kutipan langsung dari portal resmi penulisan pesan mimpinya."
          delay={45}
          rotation={2}
          color="#FFF9A6"
          seed="s20note"
          width={520}
        />
        <StampMark text="VERIFIKASI" delay={52} size={180} color="#FFE600" rotation={-8} subText="PORTAL WEB" />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 21 (0:52–0:55) — 180 frames
   "...tidak hanya penyembahan selain kepada Allah..."
   ═══════════════════════════════════════════════ */
export const Scene21: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="DEFINISI LUAS // KOREKSI PEMAHAMAN" exhibitNumber="EXHIBIT #21">
    <PaperTransition type="slam" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <DossierHeader tag="KOREKSI PERSEPSI" code="DEFINISI // #21" delay={4} />

      {/* Hero: Idol Cutout with Paper-Cut Stroke + Redacted "Menyembah Patung / Berhala" */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, width: "100%", maxWidth: 940 }}>
        <PaperCutoutImage
          src={staticFile("videomq-6/foto/berhala_wanita_papercut.png")}
          caption="BUKAN HANYA PATUNG"
          delay={8}
          rotation={-3}
          width={280}
          hasCornerTapes
          seed="s21idol"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start", flex: 1 }}>
          <PaperCutout delay={14} rotation={-2} padding="22px 42px" hasTape seed="s21a">
            <RedactionText text="Menyembah Berhala" delay={20} fontSize={48} />
          </PaperCutout>

          <AnnotationArrow direction="down" delay={26} color="#E63946" size={72} />

          <PaperCutout delay={24} rotation={2} bgColor="#E63946" padding="22px 44px" hasCornerTapes seed="s21b">
            <HeadlineText text="LEBIH DARI ITU!" delay={30} fontSize={56} color="#FAF8F2" />
          </PaperCutout>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Banyak orang mengira syirik hanya sebatas menyembah patung batu."
          delay={38}
          rotation={-2}
          color="#FFF9A6"
          seed="s21note"
          width={490}
        />
        <StampMark text="PERLUAS" delay={44} size={180} color="#1D3557" rotation={-10} subText="MAKNA KATA" />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 22 (0:55–0:58) — 180 frames
   "...tetapi juga ketergantungan berlebihan..."
   ═══════════════════════════════════════════════ */
export const Scene22: React.FC = () => (
  <PaperWrapper theme="B_DeepInk" archiveTag="SYIRIK TERSERBUNYI // TAWAKAL" exhibitNumber="EXHIBIT #22">
    <PaperTransition type="slide" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <HazardStrip text="BAHAYA TERSERBUNYI // KETERGANTUNGAN HATI // WASPADA" delay={4} rotation={-2} width={880} />

      {/* Hero: Meme Tergantung Cutout with Paper-Cut Border (Uncut BG) */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, width: "100%", maxWidth: 940 }}>
        <PaperCutoutImage
          src={staticFile("videomq-6/foto/meme_tergantung_papercut.png")}
          caption="KETERGANTUNGAN"
          delay={8}
          rotation={-3}
          width={330}
          hasCornerTapes
          seed="s22meme"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start", flex: 1 }}>
          <PaperCutout delay={14} rotation={2} bgColor="#FFE600" padding="24px 38px" hasTape seed="s22a">
            <RansomText text="KETERGANTUNGAN" delay={20} fontSize={46} />
          </PaperCutout>

          <PaperCutout delay={22} rotation={-1.5} bgColor="#FAF8F2" padding="18px 36px" hasPaperclip seed="s22b">
            <HeadlineText text="Yang Berlebihan" delay={28} fontSize={48} color="#E63946" />
          </PaperCutout>

          <StampMark text="AWAS!" delay={34} size={160} color="#E63946" rotation={-12} subText="SYIRIK KHUFI" />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Ketika hati lebih bersandar kepada materi atau manusia daripada Allah."
          delay={38}
          rotation={3}
          color="#FFC1C8"
          seed="s22note"
          width={520}
        />
        <EvidenceTag label="KHAFIY // SAMAR" sub="WASPADA HATI" delay={44} rotation={-3} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 23 (0:58–1:00) — 120 frames
   "...kepada perkara duniawi atau makhluk."
   ═══════════════════════════════════════════════ */
export const Scene23: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="BENDA & MAKHLUK // SANDARAN SALAH" exhibitNumber="EXHIBIT #23">
    <PaperTransition type="rip" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <DossierHeader tag="OBJEK KETERGANTUNGAN" code="DUNIA // MAKHLUK" delay={4} />

      {/* Hero: Globe Dunia Cutout with Paper-Cut Stroke */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, width: "100%", maxWidth: 940 }}>
        <PaperCutoutImage
          src={staticFile("videomq-6/foto/globe_dunia_papercut.png")}
          caption="DUNIAWI FANA"
          delay={8}
          rotation={-2}
          width={340}
          hasCornerTapes
          seed="s23globe"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start", flex: 1 }}>
          <PaperCutout delay={14} rotation={2} bgColor="#161D27" width={480} padding="22px 38px" hasPaperclip seed="s23a">
            <HeadlineText text="Duniawi" delay={20} fontSize={68} color="#FFE600" />
          </PaperCutout>

          <PaperCutout delay={22} rotation={-1.5} bgColor="#1D3557" width={480} padding="18px 36px" hasTape seed="s23b">
            <HeadlineText text="& Makhluk" delay={28} fontSize={54} color="#F4EBD9" />
          </PaperCutout>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <EvidenceTag label="OBJEK FANA" sub="BUKAN SESEMBAHAN" delay={36} rotation={4} />
        <StickyNote
          text="Semua makhluk lemah dan fana; sandaran sejati hanyalah Sang Pencipta."
          delay={42}
          rotation={-2}
          color="#FFF9A6"
          seed="s23note"
          width={470}
        />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 24 (1:00–1:04) — 240 frames
   "Perlunya memeriksa kembali kehidupan dan keyakinan kita..."
   ═══════════════════════════════════════════════ */
export const Scene24: React.FC = () => (
  <PaperWrapper theme="B_DeepInk" archiveTag="INTROSPEKSI DIRI // MUHASABAH" exhibitNumber="EXHIBIT #24">
    <PaperTransition type="slam" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "110px 40px 90px" }}>
      <DossierHeader tag="AGENDA MUHASABAH" code="AUDIT // KEYAKINAN" delay={4} bgColor="#1D3557" />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <PaperCutout delay={8} rotation={-1.5} bgColor="#F4EBD9" width={800} padding="28px 54px" hasPaperclip seed="s24a">
          <MarkerHighlight text="Periksa Kembali" delay={16} fontSize={66} color="#FFE600" />
        </PaperCutout>

        <PaperCutout delay={22} rotation={2.5} width={840} padding="22px 46px" hasTape seed="s24b">
          <TypewriterText text="Kehidupan & Keyakinan Kita" delay={32} fontSize={36} />
        </PaperCutout>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Apakah tawakal kita murni kepada Allah, atau masih bergantung pada hal lain?"
          delay={40}
          rotation={-2}
          color="#FFF9A6"
          seed="s24note"
          width={500}
        />
        <StampMark text="EVALUASI" delay={48} size={180} color="#FFE600" rotation={8} subText="MUHASABAH" />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 25 (1:04–1:08) — 240 frames
   "...mengembalikan segala bentuk ketergantungan..."
   ═══════════════════════════════════════════════ */
export const Scene25: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="REORIENTASI HATI // TAWAKAL MURNI" exhibitNumber="EXHIBIT #25">
    <PaperTransition type="slide" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <DossierHeader tag="ORIENTASI TAUHID" code="KEMBALI // HAKIKI" delay={4} bgColor="#E63946" />

      {/* Hero: Hati Tergantung Cutout with Paper-Cut Stroke */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, width: "100%", maxWidth: 940 }}>
        <PaperCutoutImage
          src={staticFile("videomq-6/foto/hati_tergantung_papercut.png")}
          caption="KETERGANTUNGAN HATI"
          delay={8}
          rotation={-2.5}
          width={310}
          hasTape
          seed="s25hati"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start", flex: 1 }}>
          <PaperCutout delay={14} rotation={2} bgColor="#E63946" padding="22px 38px" hasCornerTapes seed="s25a">
            <RansomText text="KEMBALIKAN" delay={20} fontSize={58} />
          </PaperCutout>

          <PaperCutout delay={22} rotation={-1.5} bgColor="#1D3557" padding="20px 38px" hasTape seed="s25b">
            <HeadlineText text="Hati Kepada Allah" delay={28} fontSize={46} color="#F4EBD9" />
          </PaperCutout>

          <StampMark text="TAWAKAL" delay={34} size={160} color="#1D3557" rotation={-8} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Serahkan seluruh hasil dan masa depan hanya kepada kehendak Allah."
          delay={40}
          rotation={2}
          color="#D4EDDA"
          seed="s25note"
          width={490}
        />
        <EvidenceTag label="TAWAKAL TOTAL" sub="IKHLAS ILAHI" delay={46} rotation={-3} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 26 (1:08–1:11) — 180 frames
   "...hanya kepada Allah."
   ═══════════════════════════════════════════════ */
export const Scene26: React.FC = () => (
  <PaperWrapper theme="B_DeepInk" archiveTag="PUNCAK SERUAN // HANYA ALLAH" exhibitNumber="EXHIBIT #26">
    <PaperTransition type="rip" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "110px 40px 90px" }}>
      <DossierHeader tag="TUJUAN TUNGGAL" code="ALLAH // ASH-SHAMAD" delay={4} bgColor="#FFE600" textColor="#161D27" />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <PaperCutout delay={8} rotation={0} bgColor="#FFE600" width={820} padding="36px 68px" hasTape seed="s26a">
          <HeadlineText text="Hanya Kepada" delay={16} fontSize={66} />
        </PaperCutout>

        <PaperCutout delay={22} rotation={-1.5} bgColor="#1D3557" width={880} padding="30px 66px" hasCornerTapes seed="s26b">
          <HeadlineText text="ALLAH ﷻ" delay={30} fontSize={92} color="#FFE600" />
        </PaperCutout>

        <StampMark text="SANGAT MUTLAK" delay={40} size={190} color="#E63946" rotation={10} subText="TIADA SEKUTU" />
      </div>

      <StickyNote
        text="Allahu Ash-Shamad: Hanya Allah tempat memohon dan bergantung."
        delay={48}
        rotation={-2}
        color="#FFF9A6"
        seed="s26note"
        width={540}
      />
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 27 (1:11–1:15) — 240 frames
   "Ayo kita bersama-sama kembali memperkuat La Ilaha Illallah..."
   ═══════════════════════════════════════════════ */
export const Scene27: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="KALIMAT TAUHID // AJAKAN BERSAMA" exhibitNumber="EXHIBIT #27">
    <PaperTransition type="slam" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <DossierHeader tag="SERUAN BERSAMA" code="SYAHADAT // 27" delay={4} bgColor="#1D3557" />

      {/* Hero: Ayo Jauhi Syirik Cutout with Paper-Cut Stroke */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, width: "100%", maxWidth: 940 }}>
        <PaperCutoutImage
          src={staticFile("videomq-6/foto/ayo_jauhi_syirik_papercut.png")}
          caption="PERKUAT TAUHID"
          delay={8}
          rotation={-2}
          width={330}
          hasCornerTapes
          seed="s27jauhi"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start", flex: 1 }}>
          <PaperCutout delay={14} rotation={2} width={520} padding="24px 38px" hasTape seed="s27a">
            <RansomText text="LAA ILAHA ILLALLAH" delay={20} fontSize={46} />
          </PaperCutout>

          <PaperCutout delay={22} rotation={-2} bgColor="#FFE600" width={500} padding="18px 36px" hasPaperclip seed="s27b">
            <MarkerHighlight text="Perkuat Tauhid!" delay={28} fontSize={48} color="#E63946" />
          </PaperCutout>

          <StampMark text="PERKUAT" delay={34} size={160} color="#1D3557" rotation={6} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <EvidenceTag label="KALIMAT IKLAS" sub="KUNCI SURGA" delay={44} rotation={-4} />
        <StickyNote
          text="Kalimat termulia yang menjadi pembeda mutlak antara iman dan syirik."
          delay={50}
          rotation={2}
          color="#D4EDDA"
          seed="s27note"
          width={490}
        />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 28 (1:15–1:18) — 180 frames
   "...bukan hanya sekadar dari ucapan..."
   ═══════════════════════════════════════════════ */
export const Scene28: React.FC = () => (
  <PaperWrapper theme="B_DeepInk" archiveTag="BUKAN RETORIKA // KOREKSI" exhibitNumber="EXHIBIT #28">
    <PaperTransition type="slide" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <DossierHeader tag="PERINGATAN LISAN" code="RETORIKA // NOL" delay={4} bgColor="#E63946" />

      {/* Hero: Lisan Anak Cutout with Paper-Cut Stroke */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, width: "100%", maxWidth: 940 }}>
        <PaperCutoutImage
          src={staticFile("videomq-6/foto/lisan_anak_papercut.png")}
          caption="BUKAN HANYA LISAN"
          delay={8}
          rotation={-2}
          width={310}
          hasCornerTapes
          seed="s28lisan"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start", flex: 1 }}>
          <PaperCutout delay={14} rotation={2} bgColor="#F4EBD9" padding="20px 36px" hasPaperclip seed="s28a">
            <RedactionText text="Bukan Sekadar Ucapan" delay={20} fontSize={42} />
          </PaperCutout>

          <PaperCutout delay={22} rotation={-1.5} bgColor="#E63946" padding="20px 38px" hasTape seed="s28b">
            <HeadlineText text="HARUS NYATA!" delay={28} fontSize={52} color="#FAF8F2" />
          </PaperCutout>

          <StampMark text="BUKTIKAN" delay={34} size={160} color="#FFE600" rotation={8} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Bukan sekadar slogan di bibir, tapi komitmen total jiwa dan raga."
          delay={38}
          rotation={-2}
          color="#FFF9A6"
          seed="s28note"
          width={500}
        />
        <EvidenceTag label="BUKTI INTEGRITAS" sub="BUKAN KATA-KATA" delay={44} rotation={3} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 29 (1:18–1:21) — 180 frames
   "...tapi keyakinan yang dibuktikan dalam kehidupan..."
   ═══════════════════════════════════════════════ */
export const Scene29: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="PEMBUKTIAN NYATA // GAYA HIDUP" exhibitNumber="EXHIBIT #29">
    <PaperTransition type="rip" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <DossierHeader tag="PENERAPAN NYATA" code="INTEGRITAS // 29" delay={4} />

      {/* Hero: Berhala Hancur Cutout with Paper-Cut Stroke */}
      <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 32, width: "100%", maxWidth: 940 }}>
        <PaperCutoutImage
          src={staticFile("videomq-6/foto/berhala_hancur_papercut.png")}
          caption="HANCURKAN BERHALA"
          delay={8}
          rotation={2.5}
          width={340}
          hasTape
          seed="s29berhala"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-end", flex: 1 }}>
          <PaperCutout delay={14} rotation={-2} width={500} padding="22px 38px" hasPaperclip seed="s29a">
            <MarkerHighlight text="Buktikan Nyata" delay={20} fontSize={56} color="#FFE600" />
          </PaperCutout>

          <PaperCutout delay={22} rotation={2} bgColor="#1D3557" width={520} padding="20px 38px" hasCornerTapes seed="s29b">
            <HeadlineText text="Dalam Kehidupan" delay={28} fontSize={48} color="#F4EBD9" />
          </PaperCutout>

          <StampMark text="PRAKTIKKAN" delay={34} size={160} color="#1D3557" rotation={-8} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Dalam perniagaan, interaksi sosial, cara pandang, dan pengambilan keputusan."
          delay={38}
          rotation={2}
          color="#FFF9A6"
          seed="s29note"
          width={490}
        />
        <EvidenceTag label="AMAL PERBUATAN" sub="BUKTI KEYAKINAN" delay={44} rotation={-4} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 30 (1:21–1:25) — 240 frames
   "...menjauhkan diri dari semua bentuk kesyirikan..."
   ═══════════════════════════════════════════════ */
export const Scene30: React.FC = () => (
  <PaperWrapper theme="B_DeepInk" archiveTag="PEMUTUSAN SYIRIK // TUNTAS" exhibitNumber="EXHIBIT #30">
    <PaperTransition type="slam" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <HazardStrip text="SINGKIRKAN SYIRIK // BERSIHKAN HATI // TUNTAS!" delay={4} rotation={-2} width={880} />

      {/* Hero: Nolak Berhala Cutout with Paper-Cut Stroke */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, width: "100%", maxWidth: 940 }}>
        <PaperCutoutImage
          src={staticFile("videomq-6/foto/nolak_berhala_papercut.png")}
          caption="JAUHI SEMUA SYIRIK"
          delay={8}
          rotation={-2}
          width={340}
          hasCornerTapes
          seed="s30nolak"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start", flex: 1 }}>
          <PaperCutout delay={14} rotation={2} bgColor="#E63946" padding="22px 38px" hasTape seed="s30a">
            <RansomText text="JAUHI SYIRIK" delay={20} fontSize={54} />
          </PaperCutout>

          <PaperCutout delay={22} rotation={-2} bgColor="#F4EBD9" padding="18px 36px" hasPaperclip seed="s30b">
            <TypewriterText text="Dari seluruh pintunya..." delay={28} fontSize={28} />
          </PaperCutout>

          <StampMark text="SINGKIRKAN" delay={34} size={160} color="#FFE600" rotation={10} subText="TUNTAS" />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Menutup segala celah yang dapat menjerumuskan pada kesyirikan modern."
          delay={42}
          rotation={2}
          color="#FFC1C8"
          seed="s30note"
          width={500}
        />
        <EvidenceTag label="TUTUP PINTU" sub="PURIFIKASI HATI" delay={48} rotation={-3} />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 31 (1:25–1:28) — 180 frames
   "...memeriksa kembali apa yang ada di kehidupan kita..."
   ═══════════════════════════════════════════════ */
export const Scene31: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="PEMERIKSAAN MANDIRI // AUDIT" exhibitNumber="EXHIBIT #31">
    <PaperTransition type="slide" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "110px 40px 90px" }}>
      <DossierHeader tag="AUDIT DIRI" code="PERIKSA // 31" delay={4} />

      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, width: "100%" }}>
        <PolaroidPhoto
          src={staticFile("broll3.jpg")}
          caption="EVALUASI DIRI"
          delay={8}
          rotation={-2}
          width={340}
          hasPaperclip
          seed="s31photo"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <PaperCutout delay={18} rotation={-2} bgColor="#1D3557" width={440} padding="24px 42px" hasTape seed="s31a">
            <MarkerHighlight text="Introspeksi" delay={26} fontSize={62} color="#FFE600" textColor="#F4EBD9" />
          </PaperCutout>

          <PaperCutout delay={30} rotation={2} width={440} padding="18px 34px" seed="s31b">
            <TypewriterText text="Kehidupan Kita" delay={38} fontSize={36} />
          </PaperCutout>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <EvidenceTag label="AUDIT AKIDAH" sub="LANGKAH PREVENTIF" delay={44} rotation={-3} />
        <StickyNote
          text="Mengecek rumah, keyakinan, dan amalan dari unsur-unsur non-syar'i."
          delay={50}
          rotation={2}
          color="#FFF9A6"
          seed="s31note"
          width={470}
        />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 32 (1:28–1:31) — 180 frames
   "...berusaha untuk memurnikan tauhid..."
   ═══════════════════════════════════════════════ */
export const Scene32: React.FC = () => (
  <PaperWrapper theme="B_DeepInk" archiveTag="IKHTIAR PEMURNIAN // TAUHID" exhibitNumber="EXHIBIT #32">
    <PaperTransition type="rip" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <DossierHeader tag="IKHTIAR MAKSIMAL" code="MURNI // 32" delay={4} bgColor="#FFE600" textColor="#161D27" />

      {/* Hero Collage: Tauhid Finger Cutout + Affirmative Typography */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 36, width: "100%", maxWidth: 940 }}>
        <PaperCutoutImage
          src={staticFile("videomq-6/foto/telunjuk_tauhid_papercut.png")}
          caption="KEMURNIAN TAUHID"
          delay={8}
          rotation={3}
          width={280}
          hasTape
          seed="s32finger"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-start", flex: 1 }}>
          <PaperCutout delay={14} rotation={1.5} bgColor="#FFE600" padding="26px 48px" hasCornerTapes seed="s32a">
            <HeadlineText text="Memurnikan" delay={20} fontSize={62} />
          </PaperCutout>

          <PaperCutout delay={22} rotation={-2} padding="22px 42px" hasPaperclip seed="s32b">
            <MarkerHighlight text="Tauhid Kita" delay={28} fontSize={68} color="#E63946" textColor="#FAF8F2" />
          </PaperCutout>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Meningkatkan ilmu, membetulkan niat, dan menjauhi riya' serta sum'ah."
          delay={38}
          rotation={-2}
          color="#FFF9A6"
          seed="s32note"
          width={490}
        />
        <StampMark text="IKHTIAR" delay={44} size={180} color="#FFE600" rotation={10} subText="WAJIB" />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 33 (1:31–1:34) — 180 frames
   "...Insya Allah, jika Allah ridho, rahmat dan pertolongan-Nya akan datang."
   ═══════════════════════════════════════════════ */
export const Scene33: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="RIDHO ALLAH // RAHMAT TURUN" exhibitNumber="EXHIBIT #33">
    <PaperTransition type="slam" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "110px 40px 90px" }}>
      <DossierHeader tag="HARAPAN & DOA" code="RIDHO // ILAHI" delay={4} bgColor="#1D3557" />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <PaperCutout delay={8} rotation={-1.5} bgColor="#1D3557" width={840} padding="34px 60px" hasTape seed="s33a">
          <HeadlineText text="Allah Ridho" delay={16} fontSize={80} color="#FFE600" />
        </PaperCutout>

        <PaperCutout delay={22} rotation={3} bgColor="#FFE600" width={820} padding="20px 44px" hasCornerTapes seed="s33b">
          <RansomText text="RAHMAT & PERTOLONGAN" delay={30} fontSize={54} />
        </PaperCutout>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <EvidenceTag label="PERTOLONGAN NYATA" sub="INSYA ALLAH" delay={38} rotation={-4} />
        <StickyNote
          text="Kemenangan sejati ada pada keridhaan dan rahmat Allah semata."
          delay={44}
          rotation={2}
          color="#D4EDDA"
          seed="s33note"
          width={460}
        />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 34 (1:34–1:39) — 300 frames
   "Semoga Allah membersihkan kita dari segala bentuk syirik..."
   ═══════════════════════════════════════════════ */
export const Scene34: React.FC = () => (
  <PaperWrapper theme="B_DeepInk" archiveTag="MUNAJAT & HARAPAN // DOA BERSAMA" exhibitNumber="EXHIBIT #34">
    <PaperTransition type="slide" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "100px 40px 80px" }}>
      <DossierHeader tag="DOA PURIFIKASI" code="MUNAJAT // 34" delay={4} bgColor="#1D3557" />

      {/* Hero: Supplication Photo + Prayer Card */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, width: "100%", maxWidth: 940 }}>
        <PolaroidPhoto
          src={staticFile("videomq-6/foto/doa_tauhid.jpg")}
          caption="MUNAJAT & HARAPAN"
          delay={8}
          rotation={-2.5}
          width={330}
          hasCornerTapes
          seed="s34doa"
        />

        <PaperCutout delay={16} rotation={1.5} isNotebook width={540} padding="28px 32px" hasTape seed="s34card">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
            <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 20, color: "#E63946", fontWeight: 700 }}>
              ★ MUNAJAT HAMBA ★
            </div>
            <TypewriterText text="Semoga Allah bersihkan diri kita..." delay={22} fontSize={25} speed={2} />
            <div style={{ marginTop: 8 }}>
              <MarkerHighlight text="Dari Segala Syirik" delay={48} fontSize={46} color="#FFE600" />
            </div>
          </div>
        </PaperCutout>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <StickyNote
          text="Doa memohon keteguhan iman dan kebersihan batin dari syirik khafiy."
          delay={60}
          rotation={-2}
          color="#FFF9A6"
          seed="s34note"
          width={520}
        />
        <StampMark text="MUNAJAT" delay={66} size={180} color="#E63946" rotation={8} subText="DOA MUSTAJAB" />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);

/* ═══════════════════════════════════════════════
   SCENE 35 (1:39–1:45) — 360 frames
   "Amin amin ya rabbal alamin."
   ═══════════════════════════════════════════════ */
export const Scene35: React.FC = () => (
  <PaperWrapper theme="A_Cream" archiveTag="PENUTUP RESMI // AMIN YA RABBAL ALAMIN" exhibitNumber="EXHIBIT #35">
    <PaperTransition type="rip" />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "110px 40px 90px" }}>
      <DossierHeader tag="PENUTUP SERUAN" code="KHATAM // SELESAI" delay={4} bgColor="#1D3557" />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <PaperCutout delay={8} rotation={0} bgColor="#1D3557" width={880} padding="46px 82px" hasCornerTapes seed="s35a">
          <HeadlineText text="Aamiin..." delay={18} fontSize={104} color="#FFE600" />
        </PaperCutout>

        <PaperCutout delay={26} rotation={-2} bgColor="#FFE600" width={820} padding="20px 50px" hasTape seed="s35b">
          <MarkerHighlight text="Ya Rabbal 'Alamin" delay={36} fontSize={58} color="#E63946" />
        </PaperCutout>

        <StampMark text="AAMIIN" delay={48} size={230} color="#1D3557" rotation={-12} subText="EDITORIAL RESMI" />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "92%", maxWidth: 880 }}>
        <EvidenceTag label="SERUAN TAUHID" sub="ARSIP SELESAI" delay={56} rotation={-3} />
        <StickyNote
          text="Semoga pesan pemurnian tauhid ini menjadi amal jariyah dan hidayah."
          delay={64}
          rotation={3}
          color="#D4EDDA"
          seed="s35note"
          width={490}
        />
      </div>
    </AbsoluteFill>
  </PaperWrapper>
);
