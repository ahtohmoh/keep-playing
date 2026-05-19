/**
 * Permission matrix tests.
 *
 * Smoke coverage of the headline rules from §5. Full matrix coverage is added
 * as the routes that consume each action come online.
 */
import { describe, it, expect } from 'vitest';
import { can } from './permissions';

const ctx = (overrides: Partial<Parameters<typeof can>[1]> = {}) => ({
  userId: 'u_1',
  tier: 'fellow' as const,
  ...overrides,
});

describe('permissions', () => {
  describe('founder', () => {
    it('can do everything', () => {
      expect(can('project.create', ctx({ tier: 'founder' }))).toBe(true);
      expect(can('member.invite', ctx({ tier: 'founder' }))).toBe(true);
      expect(can('pipeline.view_all', ctx({ tier: 'founder' }))).toBe(true);
      expect(can('knowledge.edit', ctx({ tier: 'founder' }))).toBe(true);
      expect(can('comment.delete_any', ctx({ tier: 'founder' }))).toBe(true);
    });
  });

  describe('resident', () => {
    it('can create projects', () => {
      expect(can('project.create', ctx({ tier: 'resident' }))).toBe(true);
    });
    it('can view the practice dashboard', () => {
      expect(can('dashboard.view_practice', ctx({ tier: 'resident' }))).toBe(true);
    });
    it('cannot invite members', () => {
      expect(can('member.invite', ctx({ tier: 'resident' }))).toBe(false);
    });
    it('can edit a project they lead', () => {
      expect(
        can(
          'project.edit',
          ctx({ tier: 'resident', isProjectContributor: true, contributionRole: 'lead' }),
        ),
      ).toBe(true);
    });
    it('cannot edit a project they only observe', () => {
      expect(
        can(
          'project.edit',
          ctx({ tier: 'resident', isProjectContributor: true, contributionRole: 'observer' }),
        ),
      ).toBe(false);
    });
  });

  describe('fellow', () => {
    it('cannot create projects', () => {
      expect(can('project.create', ctx({ tier: 'fellow' }))).toBe(false);
    });
    it('can only view projects they contribute to', () => {
      expect(can('project.view', ctx({ tier: 'fellow', isProjectContributor: false }))).toBe(false);
      expect(can('project.view', ctx({ tier: 'fellow', isProjectContributor: true }))).toBe(true);
    });
    it('can use the AI layer', () => {
      expect(can('ai.use_layer', ctx({ tier: 'fellow' }))).toBe(true);
    });
  });

  describe('correspondent', () => {
    it('can manage own pipeline only', () => {
      expect(can('pipeline.view_own', ctx({ tier: 'correspondent' }))).toBe(true);
      expect(can('pipeline.edit_own', ctx({ tier: 'correspondent' }))).toBe(true);
      expect(can('pipeline.view_all', ctx({ tier: 'correspondent' }))).toBe(false);
    });
    it('cannot view arbitrary projects', () => {
      expect(can('project.view', ctx({ tier: 'correspondent' }))).toBe(false);
    });
    it('cannot use the AI layer in Stage 1', () => {
      expect(can('ai.use_layer', ctx({ tier: 'correspondent' }))).toBe(false);
    });
  });

  describe('external_collaborator', () => {
    it('sees only their own engagement', () => {
      expect(
        can('project.view', ctx({ tier: 'external_collaborator', isProjectContributor: true })),
      ).toBe(true);
      expect(
        can('project.view', ctx({ tier: 'external_collaborator', isProjectContributor: false })),
      ).toBe(false);
    });
    it('cannot view the knowledge base', () => {
      expect(can('knowledge.view', ctx({ tier: 'external_collaborator' }))).toBe(false);
    });
    it('cannot create voice notes', () => {
      expect(can('voicenote.create', ctx({ tier: 'external_collaborator' }))).toBe(false);
    });
  });
});
