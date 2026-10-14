import { useLocalSearchParams } from 'expo-router';

import { articleBySlug } from '@/content/learn';
import { Chip } from '@/ui/Chip';
import { EmptyState } from '@/ui/EmptyState';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Txt } from '@/ui/Txt';

export default function Article() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const article = slug ? articleBySlug(slug) : undefined;

  if (!article) {
    return (
      <Screen header={<ScreenHeader title="Learn" />}>
        <EmptyState title="Article not found" />
      </Screen>
    );
  }

  return (
    <Screen header={<ScreenHeader title={article.group} />}>
      <Chip label={article.label} />
      <Txt variant="title">{article.title}</Txt>
      {article.paragraphs.map((p, i) => (
        <Txt key={i} variant="body">
          {p}
        </Txt>
      ))}
    </Screen>
  );
}
