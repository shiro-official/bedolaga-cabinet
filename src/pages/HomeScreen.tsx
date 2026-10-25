import { EbunnyWelcomeBanner } from '@/components/ebunny/WelcomeBanner';
import { useLiteMode } from '@/hooks/useLiteMode';

import Dashboard from './Dashboard';
import DashboardLite from './DashboardLite';

/**
 * Развилка главного экрана.
 *
 * Маршрут «/» остаётся один: диплинки, история переходов и нижняя панель не
 * должны знать, какой вид включил оператор. Оба экрана импортируются обычным
 * импортом, а не ленивым, — на «/» приходится первая отрисовка, и подгрузка
 * чанка ровно здесь стоила бы того самого времени, ради которого простой вид
 * и делался.
 */
export default function HomeScreen() {
  const { lite } = useLiteMode();

  return (
    <div className="ebunny-home">
      <EbunnyWelcomeBanner />
      {lite ? <DashboardLite /> : <Dashboard />}
    </div>
  );
}
