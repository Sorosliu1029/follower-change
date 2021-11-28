import * as Maizzle from '@maizzle/framework'

const template = `---
title: Using Maizzle on the server
---

<!DOCTYPE html>
<html>
  <head>
    <if condition="page.css">
      <style>{{{ page.css }}}</style>
    </if>
  </head>
  <body>
    <table>
      <tr>
        <td class="button">
          <a href="https://maizzle.com">Confirm email address</a>
        </td>
      </tr>
    </table>
  </body>
</html>`

Maizzle.render(template, {
  tailwind: {
    config: {},
    css: `
        @tailwind utilities;
        .button { @apply rounded text-center bg-blue-500 text-white; }
        .button:hover { @apply bg-blue-700; }
        .button a { @apply inline-block py-16 px-24 text-sm font-semibold no-underline text-white; }
      `,
  },
  maizzle: {},
})
  .then(({ html }) => console.log(html))
  .catch((error) => console.log(error))
