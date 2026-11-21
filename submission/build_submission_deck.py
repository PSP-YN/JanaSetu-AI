from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.dml import MSO_THEME_COLOR
from pathlib import Path

OUT = Path('submission')
ASSET = OUT / 'assets'
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank = prs.slide_layouts[6]
BG = RGBColor(17, 27, 26)
PANEL = RGBColor(29, 43, 40)
PANEL2 = RGBColor(37, 51, 47)
AMBER = RGBColor(222, 147, 56)
AMBER2 = RGBColor(178, 89, 22)
CREAM = RGBColor(248, 244, 235)
MUTED = RGBColor(190, 196, 184)
GREEN = RGBColor(120, 170, 139)
RED = RGBColor(217, 133, 102)
FONT = 'Aptos'

def rect(slide,x,y,w,h,fill,round=True,line=None):
    shape=slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if round else MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    shape.fill.solid(); shape.fill.fore_color.rgb=fill
    shape.line.fill.background() if line is None else None
    if line:
        shape.line.color.rgb=line; shape.line.width=Pt(1)
    if round:
        try: shape.adjustments[0]=0.08
        except Exception: pass
    return shape

def txt(slide,text,x,y,w,h,size=18,color=CREAM,bold=False,align=PP_ALIGN.LEFT,font=FONT,margin=0.04,italic=False):
    box=slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf=box.text_frame; tf.clear(); tf.word_wrap=True
    tf.margin_left=Inches(margin); tf.margin_right=Inches(margin); tf.margin_top=Inches(margin); tf.margin_bottom=Inches(margin)
    p=tf.paragraphs[0]; p.alignment=align
    r=p.add_run(); r.text=text; r.font.name=font; r.font.size=Pt(size); r.font.bold=bold; r.font.italic=italic; r.font.color.rgb=color
    return box

def base(title,kicker='JANASETU AI'):
    slide=prs.slides.add_slide(blank)
    slide.background.fill.solid(); slide.background.fill.fore_color.rgb=BG
    rect(slide,0,0,0.12,7.5,AMBER,False)
    txt(slide,kicker,0.55,0.32,5,0.24,9,AMBER,True)
    txt(slide,title,0.55,0.68,12.1,0.62,27,CREAM,True)
    rect(slide,0.55,7.08,12.2,0.012,PANEL2,False)
    txt(slide,'Independent public-benefits readiness prototype  •  November 2026',0.58,7.15,10,0.18,8,MUTED)
    return slide

def bullet_card(slide,x,y,w,h,title,body,num=None):
    rect(slide,x,y,w,h,PANEL)
    if num is not None: txt(slide,str(num).zfill(2),x+0.22,y+0.18,0.5,0.25,10,AMBER,True)
    txt(slide,title,x+0.22,y+0.58,w-0.44,0.48,17,CREAM,True)
    txt(slide,body,x+0.22,y+1.16,w-0.44,h-1.34,11,MUTED)

def add_img(slide,path,x,y,w,h):
    p=Path(path)
    if p.exists():
        slide.shapes.add_picture(str(p), Inches(x), Inches(y), width=Inches(w), height=Inches(h))

# 1 Cover
s=prs.slides.add_slide(blank); s.background.fill.solid(); s.background.fill.fore_color.rgb=BG
rect(s,0,0,0.16,7.5,AMBER,False)
rect(s,0.7,0.72,5.9,5.95,PANEL)
txt(s,'JANASETU AI',1.08,1.15,4.8,0.3,11,AMBER,True)
txt(s,'Public benefits,\nmade understandable.',1.05,1.85,5.25,1.75,32,CREAM,True)
txt(s,'A multilingual benefits-readiness workspace connecting scheme sources, citizen facts, evidence gaps and next steps.',1.08,4.0,4.95,0.95,16,MUTED)
rect(s,1.08,5.42,3.0,0.42,AMBER2)
txt(s,'PUBLIC-BETA PREVIEW',1.18,5.51,2.8,0.18,9,CREAM,True)
txt(s,'Independent prototype  •  India  •  November 2026',1.08,6.15,4.9,0.25,10,MUTED)
add_img(s,ASSET/'landing-desktop.png',7.0,0.85,5.65,3.35)
add_img(s,ASSET/'workspace-mobile-390.png',9.1,4.35,2.0,2.65)
rect(s,7.0,4.55,1.75,1.6,PANEL2)
txt(s,'6',7.28,4.82,1.2,0.6,32,AMBER,True)
txt(s,'interface\nlanguages',7.28,5.48,1.2,0.52,11,CREAM,True)

# 2 Problem
s=base('Discovery is not the same as readiness')
txt(s,'Citizens still have to translate scattered information into a safe next action.',0.62,1.52,11.8,0.42,17,MUTED)
bullet_card(s,0.65,2.35,3.85,3.45,'Fragmented sources','Scheme details, eligibility conditions and application channels are spread across multiple official sources.',1)
bullet_card(s,4.74,2.35,3.85,3.45,'Hard-to-interpret rules','Citizens must map household facts to age, income, location, occupation and other scheme conditions.',2)
bullet_card(s,8.83,2.35,3.85,3.45,'Evidence and follow-up','Missing documents, forms and deadlines create friction between discovering a scheme and preparing to apply.',3)
txt(s,'JanaSetu focuses on the preparation gap — not replacing the government decision-maker.',0.72,6.18,11.7,0.4,15,AMBER,True,PP_ALIGN.CENTER)

# 3 Solution workflow
s=base('One traceable path from profile to preparation')
steps=[('01','Profile','Citizen-stated facts'),('02','Discover','Source-linked records'),('03','Assess','Deterministic checks'),('04','Identify','Evidence gaps'),('05','Prepare','Local checklist'),('06','Follow up','Reminders and next steps')]
for i,(n,t,b) in enumerate(steps):
    x=0.62+i*2.08
    rect(s,x,2.05,1.78,2.25,PANEL)
    txt(s,n,x+0.18,2.25,0.6,0.28,10,AMBER,True)
    txt(s,t,x+0.18,2.85,1.4,0.4,16,CREAM,True)
    txt(s,b,x+0.18,3.38,1.42,0.62,10,MUTED)
    if i<5: txt(s,'›',x+1.82,2.95,0.25,0.4,22,AMBER,True,PP_ALIGN.CENTER)
rect(s,0.65,4.85,12.0,1.05,PANEL2)
txt(s,'Important boundary',0.92,5.08,2.0,0.25,11,AMBER,True)
txt(s,'A preliminary screen is not an official eligibility decision. A preparation record is not an application submission.',3.0,5.0,9.1,0.55,15,CREAM,True)

# 4 Product evidence
s=base('A citizen-facing workflow with visible safety boundaries')
rect(s,0.62,1.55,6.0,4.85,PANEL)
add_img(s,ASSET/'assessment-review-pending.png',0.78,1.72,5.68,3.42)
txt(s,'SCHEME DISCOVERY',0.92,5.35,2.5,0.22,9,AMBER,True)
txt(s,'Rule prototype · independent review pending',0.92,5.67,5.3,0.3,12,CREAM,True)
rect(s,6.88,1.55,5.82,4.85,PANEL)
add_img(s,ASSET/'local-checklist-not-submitted.png',7.04,1.72,5.5,3.42)
txt(s,'LOCAL PREPARATION',7.2,5.35,2.5,0.22,9,AMBER,True)
txt(s,'Not submitted · not an eligibility decision',7.2,5.67,5.1,0.3,12,CREAM,True)

# 5 Architecture
s=base('Benefit Readiness Graph — the product architecture')
# left source box
rect(s,0.65,1.75,2.45,3.65,PANEL)
txt(s,'SOURCE LAYER',0.9,2.0,1.9,0.25,10,AMBER,True)
txt(s,'Official scheme\nreferences',0.9,2.62,1.95,0.8,17,CREAM,True)
txt(s,'Version • freshness\nPublisher • evidence',0.9,3.72,1.95,0.8,11,MUTED)
# middle rules
rect(s,3.62,1.75,2.65,3.65,PANEL)
txt(s,'RULE LAYER',3.9,2.0,1.9,0.25,10,AMBER,True)
txt(s,'Deterministic\ncondition engine',3.9,2.62,2.1,0.8,17,CREAM,True)
txt(s,'Matched • not matched\nUnknown • review pending',3.9,3.72,2.1,0.8,11,MUTED)
# citizen
rect(s,6.78,1.75,2.65,3.65,PANEL)
txt(s,'CITIZEN CONTEXT',7.05,2.0,2.1,0.25,10,AMBER,True)
txt(s,'Profile and\nevidence',7.05,2.62,2.1,0.8,17,CREAM,True)
txt(s,'Purpose consent\nLocal-first records',7.05,3.72,2.1,0.8,11,MUTED)
# output
rect(s,9.94,1.75,2.72,3.65,PANEL2)
txt(s,'READINESS OUTPUT',10.2,2.0,2.1,0.25,10,AMBER,True)
txt(s,'Explainable\nnext actions',10.2,2.62,2.1,0.8,17,CREAM,True)
txt(s,'Evidence gaps\nLocal checklist\nFollow-up',10.2,3.72,2.1,1.0,11,MUTED)
for x in [3.15,6.33,9.49]: txt(s,'→',x,3.08,0.38,0.5,24,AMBER,True,PP_ALIGN.CENTER)
txt(s,'Publication, cloud storage and external actions are separately gated by review, consent and authorization.',0.82,5.9,11.8,0.42,13,AMBER,True,PP_ALIGN.CENTER)

# 6 Safety
s=base('Trust is enforced as a workflow constraint')
items=[('Local-first','Profile, assessment and drafts remain in the browser unless a separate cloud purpose is approved.'),('Independent review','Scheme source, rule, legal and publisher approvals are separate roles; no seeded scheme self-approves.'),('Consent boundaries','Cloud sync, case persistence and document access require separate purpose-scoped consent.'),('Citizen control','The extension previews fields; the citizen chooses what to fill. It does not submit forms.'),('Fail closed','No approved scheme, scanner identity or authorized adapter means no corresponding external action.')]
for i,(title,body) in enumerate(items):
    col=i%2; row=i//2; x=0.7+col*6.15; y=1.65+row*1.55
    rect(s,x,y,5.75,1.22,PANEL)
    txt(s,title,x+0.2,y+0.18,2.0,0.25,13,AMBER,True)
    txt(s,body,x+2.0,y+0.15,3.48,0.88,10,MUTED)

# 7 Validation
s=base('What has been tested — and what has not')
metrics=[('131','unit tests'),('49','browser E2E tests'),('6','interface languages'),('14/14','public tables with RLS')]
for i,(n,label) in enumerate(metrics):
    x=0.68+i*3.12
    rect(s,x,1.72,2.75,1.35,PANEL)
    txt(s,n,x+0.2,1.9,2.3,0.5,25,AMBER,True)
    txt(s,label,x+0.2,2.48,2.35,0.28,10,CREAM,True)
rect(s,0.68,3.48,5.8,2.35,PANEL)
txt(s,'VERIFIED',0.95,3.75,1.5,0.25,10,GREEN,True)
txt(s,'Production build and TypeScript checks\nWCAG 2.1 AA serious/critical scans on 8 routes\nMobile citizen journey at 390 × 844\nHosted black-box synthetic profile → checklist flow',0.95,4.2,5.0,1.25,12,CREAM)
rect(s,6.78,3.48,5.8,2.35,PANEL)
txt(s,'NOT YET VERIFIED',7.05,3.75,2.3,0.25,10,RED,True)
txt(s,'Independent penetration test and DPIA\nNative-speaker and assistive-tech study\nProduction load and disaster-recovery tests\nOfficial scheme approval and department integration',7.05,4.2,5.0,1.25,12,CREAM)

# 8 Roadmap / status
s=base('Public-beta preview — external release gates remain')
rect(s,0.65,1.65,5.9,4.7,PANEL)
txt(s,'CURRENT VERIFIED STATE',0.95,1.98,3.2,0.25,10,AMBER,True)
status=[('4','scheme records, 0 approved/published'),('0','legally approved consent policies'),('0','scanner identities / deployed Edge Functions'),('0','authorized government adapters')]
for i,(n,l) in enumerate(status):
    y=2.55+i*0.8
    txt(s,n,0.98,y,0.75,0.4,23,AMBER,True)
    txt(s,l,1.85,y+0.06,4.15,0.34,12,CREAM)
rect(s,6.88,1.65,5.75,4.7,PANEL2)
txt(s,'RELEASE SEQUENCE',7.18,1.98,2.8,0.25,10,AMBER,True)
road=[('1','Local-first public beta'),('2','Independent scheme verification'),('3','Legal approval + secure accounts'),('4','Persistent malware scanner'),('5','Authorized department APIs')]
for i,(n,l) in enumerate(road):
    y=2.55+i*0.68
    rect(s,7.18,y,0.38,0.38,AMBER2)
    txt(s,n,7.26,y+0.07,0.2,0.2,9,CREAM,True)
    txt(s,l,7.78,y+0.04,4.3,0.3,12,CREAM)
txt(s,'Seeking pilot partners, qualified scheme reviewers and authorized department integration partners.',0.78,6.55,11.8,0.28,12,AMBER,True,PP_ALIGN.CENTER)

prs.save(OUT/'JanaSetu_AI_Submission_Deck.pptx')
print('Created', OUT/'JanaSetu_AI_Submission_Deck.pptx')
