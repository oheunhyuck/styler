import { Style } from '@/lib/types';
import StyleCard from './StyleCard';

export default function Gallery({ styles }: { styles: Style[] }) {
  if (styles.length === 0) {
    return (
      <div className="text-center py-24 text-gray-600">
        <p className="text-4xl mb-4">✦</p>
        <p className="text-lg">아직 등록된 스타일이 없습니다.</p>
        <p className="text-sm mt-2">첫 번째 스타일을 올려보세요!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {styles.map((style) => (
        <StyleCard key={style.id} style={style} />
      ))}
    </div>
  );
}
