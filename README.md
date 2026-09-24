# analytics

## CRM campaign attribution

The Meta Ads page can enrich campaign rows with CRM bookings, paid customers,
deposits, committed revenue, CAC and ROAS. Configure these server-side variables
in the deployment environment (never expose the API key to the browser):

```text
LMS_API_URL=https://api.devready.gr
LMS_API_KEY=<read-only admin API key created in the LMS>
META_ADS_PAGE_ID=<connected Meta Page ID>
```

The LMS API key is sent only from the Next.js server to the protected `/api/users`
and `/api/enrollments` endpoints. Matching uses normalized email first and phone
as a fallback; duplicate leads are deduplicated per campaign.
