<script lang="ts">
  interface Props {
    applicantName: string
    certifications?: string[]
    positionTitle?: string
    avatarUrl?: string
  }

  let {
    applicantName,
    positionTitle,
    certifications = ['driver', 'builder'],
    avatarUrl = '',
  }: Props = $props()

  const visibleCerts = $derived(certifications.slice(0, 3))
  const overflowCount = $derived(Math.max(0, certifications.length - 3))
  const initials = $derived(
    applicantName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2),
  )
</script>

<div class="applicant-card">
  <div class="card-content">
    <div class="profile-section">
      <div class="avatar">
        {#if avatarUrl}
          <img src={avatarUrl} alt={applicantName} />
        {:else}
          <span class="initials">{initials}</span>
        {/if}
      </div>

      <div class="profile-info">
        <h3 class="applicant-name">{applicantName}</h3>
        <p class="position-title">{positionTitle}</p>

        {#if certifications.length > 0}
          <div class="skills">
            {#each visibleCerts as skill}
              <span class="skill-tag">{skill}</span>
            {/each}
            {#if overflowCount > 0}
              <span class="skill-tag overflow">+{overflowCount}</span>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .applicant-card {
    background: var(--color-background-elevated);
    border: 1px solid var(--color-border-elevated);
    border-radius: var(--radius-lg);
    margin: 0 0 var(--space-3) 0;
    min-height: var(--tap-large);
    cursor: pointer;
    touch-action: pan-x;
    user-select: none;
    transition: all var(--duration-fast) var(--ease-out);
    position: relative;
    box-shadow: var(--shadow-subtle);
  }

  .applicant-card:active {
    transform: scale(0.98);
    background: var(--color-background-app);
  }

  .card-content {
    padding: var(--space-4);
  }

  .profile-section {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .avatar {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-full);
    overflow: hidden;
    background: var(--color-background-app);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .initials {
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    text-transform: uppercase;
  }

  .profile-info {
    flex: 1;
    min-width: 0;
  }

  .applicant-name {
    font-size: var(--font-size-subhead);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-1) 0;
    line-height: var(--line-height-tight);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .position-title {
    font-size: var(--font-size-caption);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-3) 0;
    line-height: var(--line-height-normal);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .skills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .skill-tag {
    display: inline-flex;
    align-items: center;
    padding: var(--space-1) var(--space-2);
    background: var(--color-background-app);
    color: var(--color-text-secondary);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    line-height: 1;
    white-space: nowrap;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .skill-tag.overflow {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-tertiary);
  }

  /* Focus states */
  .applicant-card:focus-visible {
    outline: none;
    box-shadow: var(--ring);
  }

  /* Hover states for desktop */
  @media (hover: hover) {
    .applicant-card:hover {
      background: var(--color-background-elevated);
    }
  }
</style>
