-- Seed four source-checked but unapproved central schemes for independent review.
-- These records remain review_pending/source_checked and cannot create application cases.
do $$
declare
  v_source uuid;
  v_scheme uuid;
  v_version uuid;
  v_content jsonb;
  v_rules jsonb;
  v_hash text;
begin
  -- PM-KISAN
  insert into public.scheme_sources(publisher,source_url,source_type,last_checked_at,source_revision,freshness_days,access_notes)
  values ('Department of Agriculture and Farmers Welfare','https://pmkisan.gov.in/','official_government',now(),'Live portal checked 2026-11-09; revised operational guidelines dated 2020-03-29',30,'Manual source review only. Current circular reconciliation and full exclusion list remain pending; no automated portal access or submission permission.')
  on conflict (source_url) do update set publisher=excluded.publisher,last_checked_at=excluded.last_checked_at,source_revision=excluded.source_revision,freshness_days=excluded.freshness_days,access_notes=excluded.access_notes
  returning id into v_source;
  insert into public.schemes(slug,name,level,state_code,category,publication_status)
  values ('pm-kisan','PM-KISAN Samman Nidhi','central',null,'Agriculture','review_pending')
  on conflict (slug) do update set name=excluded.name,category=excluded.category,publication_status='review_pending',updated_at=now()
  returning id into v_scheme;
  v_content:=jsonb_build_object(
    'slug','pm-kisan','name','PM-KISAN Samman Nidhi','ministry','Department of Agriculture & Farmers Welfare',
    'summary','Income support for eligible landholding farmer families, subject to exclusions and State/UT verification.',
    'benefit','₹6,000 per year in three equal instalments, subject to scheme rules.',
    'source_checked','2026-11-09','source_period','24th instalment released 2026-10-30; eKYC mandatory; suspected post-2019 land acquisition and multiple-family claims may be withheld pending physical verification.',
    'source_url','https://pmkisan.gov.in/','related_sources',jsonb_build_array('https://pmkisan.gov.in/Documents/RevisedPM-KISANOperationalGuidelines%28English%29.pdf'),
    'documents',jsonb_build_array('State/UT land record or cultivable-land evidence','Official identity/eKYC requirements','Bank details only through the official government channel'),
    'rule_notes',jsonb_build_array('Landholding farmer family with cultivable land recorded by the concerned State/UT.','Complete exclusion categories and later circulars require reviewer reconciliation.','State/UT administration verifies eligible farmer families.','JanaSetu must not collect Aadhaar, bank details or eKYC secrets.'),
    'review_status','pending','jurisdiction','central','application_url','https://pmkisan.gov.in/'
  );
  v_rules:=jsonb_build_object('state','draft','review_status','pending','checks',jsonb_build_array(
    jsonb_build_object('key','land_record','rule','Cultivable land recorded by State/UT','status','requires_independent_review'),
    jsonb_build_object('key','exclusions','rule','Complete current exclusion list and family definition','status','incomplete'),
    jsonb_build_object('key','state_verification','rule','State/UT verification and physical verification holds','status','official_confirmation_required'),
    jsonb_build_object('key','ekyc','rule','Mandatory eKYC at official channel; never collect credentials in JanaSetu','status','source_checked')
  ));
  v_hash:=encode(extensions.digest(convert_to(v_content::text,'UTF8'),'sha256'),'hex');
  insert into public.scheme_versions(scheme_id,version_number,source_id,source_url,content,rule_set,content_sha256,verification_status)
  values(v_scheme,1,v_source,'https://pmkisan.gov.in/',v_content,v_rules,v_hash,'source_checked')
  on conflict (scheme_id,version_number) do update set source_id=excluded.source_id,source_url=excluded.source_url,content=excluded.content,rule_set=excluded.rule_set,content_sha256=excluded.content_sha256,verification_status='source_checked'
  returning id into v_version;
  update public.schemes set current_version_id=v_version,publication_status='review_pending',updated_at=now() where id=v_scheme;

  -- PMAY-U 2.0
  insert into public.scheme_sources(publisher,source_url,source_type,last_checked_at,source_revision,freshness_days,access_notes)
  values ('Ministry of Housing and Urban Affairs','https://pmay-urban.gov.in/guideline','official_government',now(),'Official index checked 2026-11-09; PMAY-U 2.0 guidelines Sep 2024; AHP SOP Apr 2026; Angikaar 2026 document listed',30,'2026 guidance and vertical amendments not fully reconciled; AHP SOP file could not be independently reviewed in this pass; manual review required.')
  on conflict (source_url) do update set publisher=excluded.publisher,last_checked_at=excluded.last_checked_at,source_revision=excluded.source_revision,freshness_days=excluded.freshness_days,access_notes=excluded.access_notes
  returning id into v_source;
  insert into public.schemes(slug,name,level,state_code,category,publication_status)
  values ('pmay-u-2','Pradhan Mantri Awas Yojana — Urban 2.0','central',null,'Housing','review_pending')
  on conflict (slug) do update set name=excluded.name,category=excluded.category,publication_status='review_pending',updated_at=now()
  returning id into v_scheme;
  v_content:=jsonb_build_object(
    'slug','pmay-u-2','name','Pradhan Mantri Awas Yojana — Urban 2.0','ministry','Ministry of Housing and Urban Affairs',
    'summary','Housing assistance for eligible urban EWS, LIG and MIG beneficiary families through scheme-defined verticals.',
    'benefit','Assistance depends on the applicable PMAY-U 2.0 vertical and current implementation rules.',
    'source_checked','2026-11-09','source_period','Official index lists Sep 2024 scheme guidelines, Apr 2026 AHP SOP and Angikaar 2026 guidelines; complete amendment and vertical reconciliation pending.',
    'source_url','https://pmay-urban.gov.in/guideline','related_sources',jsonb_build_array('https://pmay-urban.gov.in/uploads/guidelines/Operational-Guidelines-of-PMAY-U-2.pdf','https://pmay-urban.gov.in/pmay-u-2.0-guidelines'),
    'documents',jsonb_build_array('Household and family details','Income certificate or accepted income evidence','Declaration/evidence regarding pucca-house ownership','Prior housing-assistance declaration'),
    'rule_notes',jsonb_build_array('EWS up to ₹3 lakh, LIG ₹3–6 lakh and MIG ₹6–9 lakh annual household income under cited guidelines; States/UTs may redefine EWS with concurrence.','No pucca house anywhere in India, subject to guideline provisions.','Prior government housing allotment in the preceding 20 years may disqualify.','Urban route only; vertical-specific and State/UT rules are not fully encoded.'),
    'review_status','pending','jurisdiction','central','application_url','https://pmay-urban.gov.in/'
  );
  v_rules:=jsonb_build_object('state','draft','review_status','pending','checks',jsonb_build_array(
    jsonb_build_object('key','jurisdiction','rule','Urban residence and applicable PMAY-G/PMAY-U route','status','incomplete'),
    jsonb_build_object('key','income','rule','Current EWS/LIG/MIG thresholds and State/UT modifications','status','source_checked_needs_2026_reconciliation'),
    jsonb_build_object('key','house_ownership','rule','No pucca house anywhere in India','status','source_checked'),
    jsonb_build_object('key','prior_benefit','rule','Prior housing benefit restriction and vertical rules','status','source_checked_needs_independent_review')
  ));
  v_hash:=encode(extensions.digest(convert_to(v_content::text,'UTF8'),'sha256'),'hex');
  insert into public.scheme_versions(scheme_id,version_number,source_id,source_url,content,rule_set,content_sha256,verification_status)
  values(v_scheme,1,v_source,'https://pmay-urban.gov.in/guideline',v_content,v_rules,v_hash,'source_checked')
  on conflict (scheme_id,version_number) do update set source_id=excluded.source_id,source_url=excluded.source_url,content=excluded.content,rule_set=excluded.rule_set,content_sha256=excluded.content_sha256,verification_status='source_checked'
  returning id into v_version;
  update public.schemes set current_version_id=v_version,publication_status='review_pending',updated_at=now() where id=v_scheme;

  -- PMUY 2.0
  insert into public.scheme_sources(publisher,source_url,source_type,last_checked_at,source_revision,freshness_days,access_notes)
  values ('Ministry of Petroleum and Natural Gas / Oil Marketing Companies','https://www.pmuy.gov.in/ujjwala2.html','official_government',now(),'Eligibility page and FAQ checked 2026-11-09; no page revision date stated',30,'Manual source review only. Aadhaar, bank details and biometric eKYC remain on official OMC/distributor channels.')
  on conflict (source_url) do update set publisher=excluded.publisher,last_checked_at=excluded.last_checked_at,source_revision=excluded.source_revision,freshness_days=excluded.freshness_days,access_notes=excluded.access_notes
  returning id into v_source;
  insert into public.schemes(slug,name,level,state_code,category,publication_status)
  values ('pm-ujjwala','Pradhan Mantri Ujjwala Yojana 2.0','central',null,'Energy & household','review_pending')
  on conflict (slug) do update set name=excluded.name,category=excluded.category,publication_status='review_pending',updated_at=now()
  returning id into v_scheme;
  v_content:=jsonb_build_object(
    'slug','pm-ujjwala','name','Pradhan Mantri Ujjwala Yojana 2.0','ministry','Ministry of Petroleum and Natural Gas',
    'summary','LPG connection support for adult women from qualifying poor households, subject to current OMC requirements.',
    'benefit','Deposit-free connection with first refill and stove benefits under official terms; confirm current OMC implementation.',
    'source_checked','2026-11-09','source_period','Eligibility page and FAQ checked 2026-11-09. Adult woman 18+, no existing OMC LPG connection for family members in household composition, qualifying poor-household category/declaration; biometric Aadhaar authentication at distributor.',
    'source_url','https://www.pmuy.gov.in/ujjwala2.html','related_sources',jsonb_build_array('https://www.pmuy.gov.in/faq.html'),
    'documents',jsonb_build_array('KYC form','Aadhaar for applicant and adult family members as required by official process','Ration card or accepted family-composition document','Proof of address where required','Bank details for DBTL through official channel','Deprivation declaration'),
    'rule_notes',jsonb_build_array('Applicant must be a woman aged 18 or older.','No LPG connection registered to any family member listed in the family-composition document.','FAQ lists SC, ST, PMAY-G, MBC, AAY, tea/ex-tea garden tribes, forest dwellers, island/river-island residents, SECC and 14-point deprivation declaration categories.','Biometric Aadhaar authentication is mandatory at OMC distributor.','PNG connection holders cannot receive PMUY or subsidized non-PMUY LPG.','JanaSetu must not collect Aadhaar, bank details or biometric information.'),
    'review_status','pending','jurisdiction','central','application_url','https://www.pmuy.gov.in/ujjwala2.html'
  );
  v_rules:=jsonb_build_object('state','draft','review_status','pending','checks',jsonb_build_array(
    jsonb_build_object('key','adult_woman','rule','Applicant woman aged 18+','status','source_checked'),
    jsonb_build_object('key','existing_lpg','rule','No existing OMC LPG connection for family members listed in household composition','status','source_checked'),
    jsonb_build_object('key','poor_household','rule','Qualifying category or 14-point deprivation declaration','status','requires_independent_review'),
    jsonb_build_object('key','biometric_ekyc','rule','Biometric Aadhaar authentication at distributor; never collect in JanaSetu','status','source_checked')
  ));
  v_hash:=encode(extensions.digest(convert_to(v_content::text,'UTF8'),'sha256'),'hex');
  insert into public.scheme_versions(scheme_id,version_number,source_id,source_url,content,rule_set,content_sha256,verification_status)
  values(v_scheme,1,v_source,'https://www.pmuy.gov.in/ujjwala2.html',v_content,v_rules,v_hash,'source_checked')
  on conflict (scheme_id,version_number) do update set source_id=excluded.source_id,source_url=excluded.source_url,content=excluded.content,rule_set=excluded.rule_set,content_sha256=excluded.content_sha256,verification_status='source_checked'
  returning id into v_version;
  update public.schemes set current_version_id=v_version,publication_status='review_pending',updated_at=now() where id=v_scheme;

  -- PM-USP CSSS
  insert into public.scheme_sources(publisher,source_url,source_type,last_checked_at,source_revision,freshness_days,access_notes)
  values ('Department of Higher Education, Ministry of Education / National Scholarship Portal','https://scholarships.gov.in/Students','official_government',now(),'NSP AY 2026-27 Students and All-Scholarships pages checked 2026-11-09; deadline conflict remains',7,'Official pages disagree on CSSS renewal student deadline. Treat application window as unconfirmed/closed until written clarification; do not infer fresh application availability.')
  on conflict (source_url) do update set publisher=excluded.publisher,last_checked_at=excluded.last_checked_at,source_revision=excluded.source_revision,freshness_days=excluded.freshness_days,access_notes=excluded.access_notes
  returning id into v_source;
  insert into public.schemes(slug,name,level,state_code,category,publication_status)
  values ('pm-usp-csss','PM-USP Central Sector Scholarship (CSSS)','central',null,'Education','review_pending')
  on conflict (slug) do update set name=excluded.name,category=excluded.category,publication_status='review_pending',updated_at=now()
  returning id into v_scheme;
  v_content:=jsonb_build_object(
    'slug','pm-usp-csss','name','PM-USP Central Sector Scholarship (CSSS)','ministry','Department of Higher Education, Ministry of Education',
    'summary','Merit-cum-means scholarship for eligible college and university students; current academic-year conditions must be verified.',
    'benefit','The located AY 2025-26 FAQ describes ₹12,000 per year at graduation level for the first three years and ₹20,000 per year at postgraduate level; current AY 2026-27 amounts and course treatment need verification.',
    'source_checked','2026-11-09','source_period','NSP AY 2026-27 Students announcement says renewal applications close 2026-10-31; All-Scholarships listing says 2026-09-30; search index surfaced 2026-11-30 but opened page did not corroborate. Treat window as unconfirmed/closed.',
    'source_url','https://scholarships.gov.in/Students','related_sources',jsonb_build_array('https://scholarships.gov.in/All-Scholarships','https://scholarships.gov.in/public/schemeGuidelines/CSSS_GUIDLINES_07022024_updated.pdf'),
    'documents',jsonb_build_array('Class XII marksheet and Board percentile/list evidence','Current regular undergraduate admission/enrolment proof','Family income certificate or accepted income evidence','Scholarship/fee-reimbursement declaration'),
    'rule_notes',jsonb_build_array('Cited prior-year FAQ requires students above the 80th percentile in Class XII, subject to Board list and current-year specification.','Regular undergraduate study and income criteria require current AY 2026-27 verification.','Other scholarship and renewal conditions require current-year verification.','Do not infer fresh application window from renewal announcement.','NSP OTR and identity proofing remain on official portal; JanaSetu must not collect OTR passwords or OTPs.'),
    'review_status','pending','jurisdiction','central','application_url','https://scholarships.gov.in/'
  );
  v_rules:=jsonb_build_object('state','draft','review_status','pending','checks',jsonb_build_array(
    jsonb_build_object('key','merit','rule','Current Board-wise 80th percentile list and Class XII conditions','status','prior_year_source_only'),
    jsonb_build_object('key','course','rule','Regular UG/PG course and eligible institution','status','requires_2026_27_review'),
    jsonb_build_object('key','income','rule','Current family income ceiling and evidence','status','requires_2026_27_review'),
    jsonb_build_object('key','window','rule','Fresh vs renewal application deadline conflict','status','unresolved_official_source_conflict')
  ));
  v_hash:=encode(extensions.digest(convert_to(v_content::text,'UTF8'),'sha256'),'hex');
  insert into public.scheme_versions(scheme_id,version_number,source_id,source_url,content,rule_set,content_sha256,verification_status)
  values(v_scheme,1,v_source,'https://scholarships.gov.in/Students',v_content,v_rules,v_hash,'source_checked')
  on conflict (scheme_id,version_number) do update set source_id=excluded.source_id,source_url=excluded.source_url,content=excluded.content,rule_set=excluded.rule_set,content_sha256=excluded.content_sha256,verification_status='source_checked'
  returning id into v_version;
  update public.schemes set current_version_id=v_version,publication_status='review_pending',updated_at=now() where id=v_scheme;
end;
$$;
