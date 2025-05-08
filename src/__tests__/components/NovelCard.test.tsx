import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NovelCard from '../../../components/NovelCard';
import type { NovelData } from '../../../types/novel';

const mockNovel: NovelData = {
  slug: 'test-novel',
  title: 'Test Novel Title',
  date: '2024-01-01',
  tags: ['tag1', 'tag2'],
  excerpt: 'This is a test excerpt.',
  content: 'Full content of the test novel.',
  language: 'ja',
};

describe('NovelCard', () => {
  it('renders novel title, excerpt, and tags', () => {
    render(<NovelCard novel={mockNovel} />);
    expect(screen.getByText('Test Novel Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test excerpt.')).toBeInTheDocument();
    expect(screen.getByText('#tag1')).toBeInTheDocument();
    expect(screen.getByText('#tag2')).toBeInTheDocument();
  });

  it('renders a link to the novel details page', () => {
    render(<NovelCard novel={mockNovel} />);
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/novels/test-novel');
  });
});
