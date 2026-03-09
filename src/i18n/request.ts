import {getRequestConfig} from 'next-intl/server';
import {routing} from './routings';

// export default getRequestConfig(async ({requestLocale}) => {
//   // This typically corresponds to the `[locale]` segment
//   let locale = await requestLocale;

//   // Ensure that the incoming locale is valid
//   if (!locale || !routing.locales.includes(locale as any)) {
//     locale = routing.defaultLocale;
//   }

//   return {
//     locale,
//     messages: (await import(`../../messages/${locale}.json`)).default
//   };
// });


export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Fallback to default locale if invalid
  if (!locale || !routing.locales.includes(locale as "en" | "ar")) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
