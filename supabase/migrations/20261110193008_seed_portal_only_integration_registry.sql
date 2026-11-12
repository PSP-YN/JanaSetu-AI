insert into public.scheme_integrations
(scheme_version_id,department_name,application_url,access_status,allowed_actions,authorization_reference,approved_at,expires_at)
select sv.id,x.department_name,x.application_url,'not_requested',array[]::text[],null,null,null
from public.scheme_versions sv
join public.schemes s on s.id=sv.scheme_id
join (values
 ('pm-kisan','Department of Agriculture & Farmers Welfare','https://pmkisan.gov.in/'),
 ('pmay-u-2','Ministry of Housing and Urban Affairs','https://pmay-urban.gov.in/'),
 ('pm-ujjwala','Ministry of Petroleum and Natural Gas','https://www.pmuy.gov.in/ujjwala2.html'),
 ('pm-usp-csss','Ministry of Education','https://scholarships.gov.in/')
) as x(slug,department_name,application_url) on x.slug=s.slug
where sv.id=s.current_version_id
and not exists(select 1 from public.scheme_integrations i where i.scheme_version_id=sv.id);
