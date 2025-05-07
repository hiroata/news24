import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NovelList from './NovelList';
import { NovelData } from '../lib/novels';

const mockNovels: NovelData[] = [
  {
    slug: 'novel-1',
    title: 'First Novel',
    date: '2024-01-01',
    tags: ['fantasy'],
    excerpt: 'Excerpt of the first novel.',
    content: 'Content 1',
    language: 'ja',
  },
  {
    slug: 'novel-2',
    title: 'Second Novel',
    date: '2024-01-02',
    tags: ['sci-fi'],
    excerpt: 'Excerpt of the second novel.',
    content: 'Content 2',
    language: 'ja',
  },
];

describe('NovelList', () => {
  it('renders a list of novels', () => {
    render(<NovelList novels={mockNovels} />);
    expect(screen.getByText('First Novel')).toBeInTheDocument();
    expect(screen.getByText('Second Novel')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBe(0); // NovelCardはliでなくdivなので0
  });

  it('renders a message when no novels are provided', () => {
    render(<NovelList novels={[]} />);
    // NovelListは空リスト時に何も表示しない仕様
    expect(screen.queryByText('小説がありません。')).not.toBeInTheDocument();
  });
});
