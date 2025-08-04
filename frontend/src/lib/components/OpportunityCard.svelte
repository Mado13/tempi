<script lang="ts">
  import { p } from '$router'

  import { api } from '$lib/api'
  import ActionableCard from '$lib/components/ActionableCard.svelte'
  import GhostButton from '$lib/components/GhostButton.svelte'
  import PrimaryButton from '$lib/components/PrimaryButton.svelte'
  import type { Company } from '$lib/schemas/company.schema.svelte'
  import type { ProjectPosition } from '$lib/schemas/project-position.schema.svelte'
  import type { Project } from '$lib/schemas/project.schema.svelte'

  interface Props {
    opportunity: ProjectPosition
    project?: Project
    company?: Company
    onApply: (opportunityId: string) => void
  }

  let { opportunity, project, company, onApply }: Props = $props()

  const mockJob = {
    id: '1',
    status: 'open',
    title: 'נהג משאית',
    company: {
      name: 'חברת הובלות דן',
      logo: 'https://via.placeholder.com/40x40/6C62D0/FFFFFF?text=ד',
    },
    location: 'אזור המרכז',
    job_type: 'משמרת יום',
    required_skills: ['רישיון C', 'מלגזה', 'ללא נסיעות לילה'],
    certificates: ['רישיון נהיגה על משאית', 'תעודת מלגזה'],
    payment: {
      currency: '₪',
      rate: '150',
      rate_type: 'hourly',
    },
    posted_days_ago: 2,
  }
</script>

<ActionableCard href={p('/app/worker/opportunities/:opportunity', { opportunity: opportunity.id })}>
  <header>
    <div class="header-row">
      <div class="company">
        <img src={mockJob.company.logo} alt={company?.name} />
        <div class="company-info">
          <h3>{opportunity.title}</h3>
          <span class="company-name">{company?.name}</span>
        </div>
      </div>

      <div class="actions">
        <GhostButton><IconTablerHeart /></GhostButton>
        <GhostButton><IconTablerDotsVertical /></GhostButton>
      </div>
    </div>

    <div class="meta">
      <div class="skills">
        <span class="skills-label">נדרש:</span>
        {#each mockJob.required_skills as skill}
          <span class="skill">{skill}</span>
        {/each}
      </div>

      <div class="certificates">
        <span class="certs-label">תעודות:</span>
        {#each mockJob.certificates as cert}
          <span class="certificate">{cert}</span>
        {/each}
      </div>
    </div>
  </header>

  <div class="content">
    <div class="payment">
      <IconTablerCurrencyShekel />
      <span>{opportunity.payment.rate} לשעה</span>
    </div>

    <div class="details">
      <div class="detail">
        <IconTablerMapPin />
        <span>{project?.address.formattedAddress}</span>
      </div>

      <div class="detail">
        <IconTablerClock />
        <span>{mockJob.job_type}</span>
      </div>

      <div class="detail">
        <IconTablerCalendar />
        <span>לפני {mockJob.posted_days_ago} ימים</span>
      </div>
    </div>
  </div>

  <footer>
    <PrimaryButton onclick={() => onApply(opportunity.id)}>Apply for the job</PrimaryButton>
  </footer>
</ActionableCard>

<style>
  header {
    margin-bottom: var(--space-6);
  }

  .header-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-5);
    direction: rtl;
  }

  .company {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    flex: 1;
    min-width: 0;
  }

  .company img {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    object-fit: cover;
    flex-shrink: 0;
  }

  .company-info {
    flex: 1;
    min-width: 0;
  }

  .company-info h3 {
    font-size: var(--font-size-heading);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    line-height: var(--line-height-tight);
    margin: 0 0 var(--space-1) 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .company-name {
    font-size: var(--font-size-caption);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }

  .actions {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    direction: rtl;
  }

  .skills,
  .certificates {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .skills-label,
  .certs-label {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-left: var(--space-3);
    flex-shrink: 0;
  }

  .skill {
    background-color: var(--color-warning);
    color: var(--color-text-on-primary);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-sm);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-small);
  }

  .certificate {
    background-color: var(--color-success);
    color: var(--color-text-on-primary);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-sm);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-small);
  }

  .content {
    margin-bottom: var(--space-6);
  }

  .payment {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-5);
    padding: var(--space-4);
    background: var(--color-background-overlay);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    direction: rtl;
  }

  .payment :global(svg) {
    color: var(--color-primary);
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  .payment span {
    font-weight: var(--font-weight-semibold);
    color: var(--color-primary);
    font-size: var(--font-size-subhead);
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .detail {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-caption);
    color: var(--color-text-secondary);
    direction: rtl;
  }

  .detail :global(svg) {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    opacity: 0.7;
  }

  footer {
    display: flex;
    direction: rtl;
  }
</style>
