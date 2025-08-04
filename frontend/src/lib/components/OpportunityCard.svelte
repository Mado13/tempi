<script lang="ts">
  import { onMount } from 'svelte'

  import PrimaryButton from '$lib/components/PrimaryButton.svelte'
  import SecondaryButton from '$lib/components/SecondaryButton.svelte'
  import type { ProjectPosition } from '$lib/schemas/project_position.schema.svelte'
  import { useCompaniesStore } from '$lib/stores/resources/companies.store.svelte'
  import { useProjectsStore } from '$lib/stores/resources/projects.store.svelte'

  interface Props {
    opportunity: ProjectPosition
    onApply?: (opportunityId: string) => void
  }

  let { opportunity }: Props = $props()

  const projects = useProjectsStore()
  const companies = useCompaniesStore()

  onMount(() => {
    companies.init()
    projects.init()
  })

  const project = $derived(projects.getById(opportunity.projectId))
  const company = $derived(project ? companies.getById(project.companyId) : undefined)

  $inspect({ project, company, companies })

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

<article>
  <header>
    <div class="header-row">
      <div class="company">
        <img src={mockJob.company.logo} alt={mockJob.company.name} />
        <div class="company-info">
          <h3>{opportunity.title}</h3>
          <span class="company-name">{mockJob.company.name}</span>
        </div>
      </div>

      <button class="options-button" aria-label="אפשרויות נוספות">
        <IconTablerDotsVertical />
      </button>
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
    <SecondaryButton>פרטים נוספים</SecondaryButton>
    <PrimaryButton>הגש מועמדות</PrimaryButton>
  </footer>
</article>

<style>
  article {
    /* Use design system tokens */
    background: var(--color-background-elevated);
    border: 1px solid var(--color-border-elevated);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-subtle);
    padding: var(--space-6);

    /* Mobile performance optimizations */
    contain: layout paint style;
    content-visibility: auto;
    contain-intrinsic-size: 1px 200px;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;

    /* Transitions using design system tokens */
    transition:
      box-shadow var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out);

    cursor: pointer;

    &:hover {
      box-shadow: var(--shadow-elevated);
      border-color: var(--color-border-strong);
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--ring);
    }

    &:active {
      transform: translateY(1px);
      box-shadow: var(--shadow-border);
    }
  }

  header {
    margin-bottom: var(--space-6);
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-5);
  }

  .company {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    direction: rtl;
    flex: 1;

    img {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      object-fit: cover;
      flex-shrink: 0;
    }
  }

  .company-info {
    flex: 1;
    min-width: 0; /* Allow text truncation */

    h3 {
      font-size: var(--font-size-heading);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      line-height: var(--line-height-tight);
      margin: 0 0 var(--space-1) 0;
      text-align: start;
    }

    .company-name {
      font-size: var(--font-size-small);
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-medium);
      line-height: var(--line-height-normal);
    }
  }

  .options-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: var(--tap-min);
    min-height: var(--tap-min);
    padding: var(--space-2);
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    color: var(--color-text-tertiary);
    cursor: pointer;
    touch-action: manipulation;

    transition:
      background-color var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out),
      transform var(--duration-instant) var(--ease-out);

    &:hover {
      background-color: var(--color-background-app);
      color: var(--color-text-secondary);
    }

    &:active {
      transform: scale(0.95);
      background-color: var(--color-border-default);
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--ring);
    }
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
      line-height: var(--line-height-tight);
    }

    .certificate {
      background-color: var(--color-success);
      color: var(--color-text-on-primary);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-sm);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-small);
      line-height: var(--line-height-tight);
    }
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
    background: var(--glass-bg-light);
    backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--glass-shadow);
    direction: rtl;

    :global(svg) {
      color: var(--color-primary);
      flex-shrink: 0;
      width: 20px;
      height: 20px;
    }

    span {
      font-weight: var(--font-weight-semibold);
      color: var(--color-primary);
      font-size: var(--font-size-subhead);
      line-height: var(--line-height-tight);
    }
  }

  .details {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);

    .detail {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-small);
      color: var(--color-text-secondary);
      direction: rtl;
      line-height: var(--line-height-normal);

      :global(svg) {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
        opacity: 0.7;
      }
    }
  }

  footer {
    display: flex;
    gap: var(--space-3);
    direction: rtl;
  }

  /* RTL icon corrections */
  :global(html[dir='rtl']) & {
    .detail :global(svg),
    .payment :global(svg) {
      transform: scaleX(-1);
    }
  }

  /* Mobile responsive adjustments */
  @media (max-width: 480px) {
    article {
      padding: var(--space-5);
    }

    .company img {
      width: 32px;
      height: 32px;
    }

    .company-info h3 {
      font-size: var(--font-size-subhead);
    }

    footer {
      flex-direction: column;
      gap: var(--space-3);
    }

    .details {
      gap: var(--space-4);
    }

    .meta {
      gap: var(--space-3);
    }

    .skills,
    .certificates {
      gap: var(--space-1);
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    article {
      border-width: 2px;
    }

    .skill,
    .certificate {
      border: 1px solid currentColor;
    }
  }

  /* Low-end device optimizations - disable glassmorphism */
  @media (max-resolution: 1.5dppx) {
    .payment {
      backdrop-filter: none;
      background: var(--color-background-overlay);
      box-shadow: var(--shadow-subtle);
    }
  }
</style>
