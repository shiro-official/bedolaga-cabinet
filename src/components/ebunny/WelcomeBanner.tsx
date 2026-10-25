import { useTranslation } from 'react-i18next';

/** Decorative introduction; subscription state and actions stay in the original cards. */
export function EbunnyWelcomeBanner({ login = false }: { login?: boolean }) {
  const { i18n } = useTranslation();
  const ru = i18n.language.toLowerCase().startsWith('ru');
  return (
    <aside className={login ? 'ebunny-story ebunny-story-login' : 'ebunny-story'}>
      <div className="ebunny-story-copy">
        <span className="ebunny-sticker">
          {ru ? 'Твой уголок интернета' : 'Your corner of the internet'}
        </span>
        <h2>
          {ru ? (
            <>
              Уши выше.
              <br />
              Ты дома.
            </>
          ) : (
            <>
              Ears up.
              <br />
              You're home.
            </>
          )}
        </h2>
        <p>
          {ru
            ? 'Подписка, устройства и подключение — всё в одном месте.'
            : 'Your subscription, devices and connection. All in one place.'}
        </p>
        {login && (
          <a className="ebunny-site-link" href="https://ebunny.site/">
            {ru ? '← На сайт eBunny' : '← Back to eBunny'}
          </a>
        )}
      </div>
      <img
        className="ebunny-story-rabbit"
        src="/ebunny/rabbit-laptop.png"
        alt=""
        width="400"
        height="560"
        decoding="async"
      />
    </aside>
  );
}
