# Suggested reviewable commits

No commits have been created. Each section lists exact paths and a Dutch commit message. Apply in this order; early frontend groups may depend on later groups until the complete redesign is staged. Review the small formatting-only changes in shared types and `utils/player-stats.ts` separately if preferred. The existing player localization commit is preserved.

## Beveilig voorspellingen en competitieacties

Commit message: `Beveilig voorspellingen en competitieacties`

- `app/Http/Requests/Predictions/StoreMatchPredictionRequest.php`
- `routes/web.php`
- `tests/Feature/FriendsLeagueFlowTest.php`
- `tests/Feature/MatchPredictionTest.php`

## Stabiliseer datumgevoelige regressietests

Commit message: `Stabiliseer datumgevoelige regressietests`

- `tests/Feature/PlayerDetailsPageTest.php`
- `tests/Feature/PredictionVisibilityTest.php`
- `tests/Feature/ScoreboardScoringTest.php`

## Verenig ontwerptokens en gedeelde UI

Commit message: `Verenig ontwerptokens en gedeelde UI`

- `resources/css/app.css`
- `resources/js/components/ui/display/image-with-fallback.tsx`
- `resources/js/components/ui/display/team-crest.tsx`
- `resources/js/components/ui/feedback/sonner.tsx`
- `resources/js/components/ui/forms/button.tsx`
- `resources/js/components/ui/layout/card.tsx`
- `resources/js/components/ui/overlays/sheet.tsx`

## Verbeter navigatie en paginaopbouw

Commit message: `Verbeter navigatie en paginaopbouw`

- `resources/js/app.tsx`
- `resources/js/components/app/app-footer.tsx`
- `resources/js/components/app/app-header-desktop-nav.tsx`
- `resources/js/components/app/app-header-mobile-nav.tsx`
- `resources/js/components/app/app-header.tsx`
- `resources/js/components/app/app-login-button.tsx`
- `resources/js/components/app/app-shell.tsx`
- `resources/js/components/app/mobile-navigation.tsx`
- `resources/js/components/footer/footer.tsx`
- `resources/js/components/navigation/nav-app.tsx`
- `resources/js/components/navigation/nav-user.tsx`
- `resources/js/components/typography/page-header.tsx`
- `resources/js/const/navigation.ts`
- `resources/js/layouts/app-layout.tsx`

## Verfijn wedstrijden en voorspelformulieren

Commit message: `Verfijn wedstrijden en voorspelformulieren`

- `resources/js/components/matches/chances.tsx`
- `resources/js/components/matches/details/match-data-empty-state.tsx`
- `resources/js/components/matches/details/match-data-tabs.tsx`
- `resources/js/components/matches/details/match-details-hero.tsx`
- `resources/js/components/matches/details/match-details-team-block.tsx`
- `resources/js/components/matches/details/match-event-row.tsx`
- `resources/js/components/matches/details/match-event-timeline-item.tsx`
- `resources/js/components/matches/details/match-events-card.tsx`
- `resources/js/components/matches/details/match-info-card.tsx`
- `resources/js/components/matches/details/match-info-item.tsx`
- `resources/js/components/matches/details/match-lineup-player-group.tsx`
- `resources/js/components/matches/details/match-lineup-player-item.tsx`
- `resources/js/components/matches/details/match-lineup-player-modal.tsx`
- `resources/js/components/matches/details/match-lineup-team-card.tsx`
- `resources/js/components/matches/details/match-lineups-panel.tsx`
- `resources/js/components/matches/details/match-prediction-action-row.tsx`
- `resources/js/components/matches/details/match-score-card.tsx`
- `resources/js/components/matches/details/match-score-row.tsx`
- `resources/js/components/matches/details/match-stat-comparison-bar.tsx`
- `resources/js/components/matches/details/match-stat-row.tsx`
- `resources/js/components/matches/details/match-stats-card.tsx`
- `resources/js/components/matches/details/match-stats-header.tsx`
- `resources/js/components/matches/details/match-stats-panel.tsx`
- `resources/js/components/matches/details/player-stat-card.tsx`
- `resources/js/components/matches/details/team-heading.tsx`
- `resources/js/components/matches/filters/date-filter.tsx`
- `resources/js/components/matches/filters/match-status-tabs.tsx`
- `resources/js/components/matches/filters/team-filter.tsx`
- `resources/js/components/matches/match-detail-team.tsx`
- `resources/js/components/matches/match-filters.tsx`
- `resources/js/components/matches/match-status-badge.tsx`
- `resources/js/components/matches/match-status-badges.tsx`
- `resources/js/components/matches/match-team.tsx`
- `resources/js/components/matches/prediction/prediction-availability-badge.tsx`
- `resources/js/components/matches/prediction/prediction-confidence-field.tsx`
- `resources/js/components/matches/prediction/prediction-option-card.tsx`
- `resources/js/components/matches/prediction/prediction-outcome-field.tsx`
- `resources/js/components/matches/prediction/prediction-score-fields.tsx`
- `resources/js/components/matches/prediction/prediction-score-input.tsx`
- `resources/js/components/matches/prediction/user-prediction-form.tsx`
- `resources/js/components/matches/prediction/user-prediction-login-prompt.tsx`
- `resources/js/components/matches/prediction/user-prediction-match-summary.tsx`
- `resources/js/components/matches/prediction/user-prediction-modal.tsx`
- `resources/js/components/matches/prediction/user-prediction-team.tsx`
- `resources/js/pages/match-details.tsx`
- `resources/js/pages/matches.tsx`
- `resources/js/utils/match-prediction.ts`

## Verfijn analyse en voorspellingenoverzicht

Commit message: `Verfijn analyse en voorspellingenoverzicht`

- `resources/js/components/predictions/ai-prediction-advice-card.tsx`
- `resources/js/components/predictions/ai-prediction-hero.tsx`
- `resources/js/components/predictions/ai-prediction-report-actions.tsx`
- `resources/js/components/predictions/ai-prediction-report.tsx`
- `resources/js/components/predictions/ai-prediction-score-card.tsx`
- `resources/js/components/predictions/ai-prediction-summary-card.tsx`
- `resources/js/components/predictions/ai-prediction-summary-cards.tsx`
- `resources/js/components/predictions/ai-probability-breakdown.tsx`
- `resources/js/components/predictions/ai-probability-card.tsx`
- `resources/js/components/predictions/empty-filtered-predictions-state.tsx`
- `resources/js/components/predictions/empty-predictions-state.tsx`
- `resources/js/components/predictions/filters/filter-field-label.ts`
- `resources/js/components/predictions/filters/filter-select.tsx`
- `resources/js/components/predictions/filters/match-status-segmented-filter.tsx`
- `resources/js/components/predictions/filters/search-input.tsx`
- `resources/js/components/predictions/prediction-card.tsx`
- `resources/js/components/predictions/prediction-detail-hero.tsx`
- `resources/js/components/predictions/prediction-info-grid.tsx`
- `resources/js/components/predictions/prediction-match-summary.tsx`
- `resources/js/components/predictions/prediction-page-header.tsx`
- `resources/js/components/predictions/prediction-points-badge.tsx`
- `resources/js/components/predictions/prediction-score-breakdown.tsx`
- `resources/js/components/predictions/prediction-source-card.tsx`
- `resources/js/components/predictions/prediction-source-comparison.tsx`
- `resources/js/components/predictions/prediction-status-action.tsx`
- `resources/js/components/predictions/prediction-summary-card.tsx`
- `resources/js/components/predictions/prediction-tabs.tsx`
- `resources/js/components/predictions/prediction-user-actions.tsx`
- `resources/js/components/predictions/prediction-variants.ts`
- `resources/js/components/predictions/predictions-filter-card.tsx`
- `resources/js/components/predictions/user-predicted-score-card.tsx`
- `resources/js/components/predictions/user-prediction-actions.tsx`
- `resources/js/components/predictions/user-prediction-ai-comparison-card.tsx`
- `resources/js/components/predictions/user-prediction-hero.tsx`
- `resources/js/components/predictions/user-prediction-summary.tsx`
- `resources/js/pages/ai-predictions.tsx`
- `resources/js/pages/predictions.tsx`
- `resources/js/pages/user-predictions.tsx`
- `resources/js/utils/prediction-filters.ts`
- `resources/js/utils/prediction-instructions.ts`

## Verenig groepsstanden en teamweergaven

Commit message: `Verenig groepsstanden en teamweergaven`

- `resources/js/components/groups/group-page-header.tsx`
- `resources/js/components/groups/group-panel.tsx`
- `resources/js/components/groups/group-standings-table.tsx`
- `resources/js/components/groups/group-tabs.tsx`
- `resources/js/components/groups/groups-empty-state.tsx`
- `resources/js/components/groups/points-badge.tsx`
- `resources/js/components/groups/qualification-badge.tsx`
- `resources/js/components/groups/qualification-cutoff-row.tsx`
- `resources/js/components/groups/standings-explanation-modal.tsx`
- `resources/js/components/groups/standings-explanation-trigger.tsx`
- `resources/js/components/groups/team-code-badge.tsx`
- `resources/js/components/groups/team-standing-link.tsx`
- `resources/js/components/groups/third-place-panel.tsx`
- `resources/js/components/groups/third-place-standings-table.tsx`
- `resources/js/components/teams/team-code-link.tsx`
- `resources/js/components/teams/team-hero.tsx`
- `resources/js/utils/player-stats.ts`

## Verbeter competitiebeheer en deelname

Commit message: `Verbeter competitiebeheer en deelname`

- `resources/js/components/leaderboards/boosted-prediction-settings.tsx`
- `resources/js/components/leaderboards/friends-league-card.tsx`
- `resources/js/components/leaderboards/friends-leagues-section.tsx`
- `resources/js/components/leaderboards/global-leaderboard-card.tsx`
- `resources/js/components/leaderboards/invite-code-card.tsx`
- `resources/js/components/leaderboards/leaderboard-empty-state.tsx`
- `resources/js/components/leaderboards/leaderboards-page-header.tsx`
- `resources/js/components/leaderboards/league-branding-settings.tsx`
- `resources/js/components/leaderboards/league-danger-zone-card.tsx`
- `resources/js/components/leaderboards/league-leave-card.tsx`
- `resources/js/components/leaderboards/league-member-management-item.tsx`
- `resources/js/components/leaderboards/league-members-card.tsx`
- `resources/js/components/leaderboards/league-members-management-card.tsx`
- `resources/js/components/leaderboards/league-metric.tsx`
- `resources/js/components/leaderboards/league-onboarding-card.tsx`
- `resources/js/components/leaderboards/league-reward-settings.tsx`
- `resources/js/components/leaderboards/league-settings-card.tsx`
- `resources/js/components/leaderboards/league-snapshot-card.tsx`
- `resources/js/components/leaderboards/league-upcoming-matches-card.tsx`
- `resources/js/components/leaderboards/position-metric.tsx`
- `resources/js/components/leaderboards/public-league-card.tsx`
- `resources/js/components/leaderboards/snapshot-metric.tsx`
- `resources/js/components/leaderboards/your-position-card.tsx`
- `resources/js/pages/league-create.tsx`
- `resources/js/pages/league-join.tsx`
- `resources/js/pages/league-member-predictions.tsx`
- `resources/js/pages/league-members.tsx`
- `resources/js/pages/league-predict.tsx`
- `resources/js/pages/league-settings.tsx`
- `resources/js/pages/league-show.tsx`
- `resources/js/types/leaderboard.ts`
- `resources/js/types/league.ts`
- `resources/js/utils/league-branding.ts`

## Verbeter accountinstellingen en toegankelijkheid

Commit message: `Verbeter accountinstellingen en toegankelijkheid`

- `resources/js/components/auth/password/password-input.tsx`
- `resources/js/components/auth/two-factor/two-factor-recovery-codes.tsx`
- `resources/js/components/auth/two-factor/two-factor-setup-step.tsx`
- `resources/js/components/settings/prediction-preferences-section.tsx`
- `resources/js/components/settings/settings-section.tsx`
- `resources/js/components/user/avatar-cropper.tsx`
- `resources/js/components/user/avatar-zoom-control.tsx`
- `resources/js/components/user/delete-user.tsx`
- `resources/js/components/user/profile-avatar-field.tsx`
- `resources/js/components/user/two-factor-settings.tsx`
- `resources/js/components/user/update-profile-information-form.tsx`
- `resources/js/components/user/user-info.tsx`
- `resources/js/components/user/user-menu-content.tsx`
- `resources/js/layouts/settings/layout.tsx`
- `resources/js/pages/settings/profile.tsx`
- `resources/js/utils/settings-ui.ts`

## Werk publieke schermen en foutafhandeling bij

Commit message: `Werk publieke schermen en foutafhandeling bij`

- `resources/js/components/dashboard/featured-match.tsx`
- `resources/js/components/dashboard/live-panel.tsx`
- `resources/js/components/dashboard/match-list.tsx`
- `resources/js/components/dashboard/recent-results.tsx`
- `resources/js/components/home/live-matches.tsx`
- `resources/js/components/home/platform-overview.tsx`
- `resources/js/components/home/prediction-preview.tsx`
- `resources/js/components/home/public-header.tsx`
- `resources/js/components/home/upcoming-matches.tsx`
- `resources/js/pages/auth/login.tsx`
- `resources/js/pages/contact.tsx`
- `resources/js/pages/dashboard.tsx`
- `resources/js/pages/error.tsx`
- `resources/js/pages/home.tsx`
- `resources/js/pages/how-it-works.tsx`
- `resources/js/pages/privacy.tsx`
- `resources/js/pages/scoring-guide.tsx`

## Leg ontwerpkeuzes en verificatie vast

Commit message: `Leg ontwerpkeuzes en verificatie vast`

- `.gitignore`
- `docs/frontend/DESIGN.md`
- `docs/frontend/REDESIGN-REVIEW.md`

The documentation commit also includes `docs/frontend/COMMITS.md` itself.
