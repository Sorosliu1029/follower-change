import { Context } from '@actions/github/lib/context'
import type { Follower } from '..'
import { timeFromNow } from './utils'

function toUserSection(sectionTitle: string, users: Follower[]): string {
  let userSection = ''
  if (users.length) {
    userSection += `
    <tr>
      <td style="text-align: left;">
        <p style="margin-bottom: 0; margin-top: 24px; font-weight: 600; color: #24292f;">
          &gt; ${sectionTitle}
        </p>
      </td>
    </tr>
    <tr>
    <td>`

    for (const user of users) {
      const nameSection = user.name
        ? `<span style="padding-right: 4px; font-size: 16px; color: #24292f;">${user.name}</span>`
        : ''
      const bioSection = user.bio
        ? `<div style="margin-top: 0; margin-bottom: 8px; font-size: 12px; color: #57606a;"><div>${user.bio}</div></div>`
        : ''
      const companySection = user.company
        ? `
        <span style="margin-right: 16px;">
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" style="display: inline-block; fill: currentColor; vertical-align: text-bottom;">
            <path fill-rule="evenodd"
              d="M1.5 14.25c0 .138.112.25.25.25H4v-1.25a.75.75 0 01.75-.75h2.5a.75.75 0 01.75.75v1.25h2.25a.25.25 0 00.25-.25V1.75a.25.25 0 00-.25-.25h-8.5a.25.25 0 00-.25.25v12.5zM1.75 16A1.75 1.75 0 010 14.25V1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 00.25-.25V8.285a.25.25 0 00-.111-.208l-1.055-.703a.75.75 0 11.832-1.248l1.055.703c.487.325.779.871.779 1.456v5.965A1.75 1.75 0 0114.25 16h-3.5a.75.75 0 01-.197-.026c-.099.017-.2.026-.303.026h-3a.75.75 0 01-.75-.75V14h-1v1.25a.75.75 0 01-.75.75h-3zM3 3.75A.75.75 0 013.75 3h.5a.75.75 0 010 1.5h-.5A.75.75 0 013 3.75zM3.75 6a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM3 9.75A.75.75 0 013.75 9h.5a.75.75 0 010 1.5h-.5A.75.75 0 013 9.75zM7.75 9a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM7 6.75A.75.75 0 017.75 6h.5a.75.75 0 010 1.5h-.5A.75.75 0 017 6.75zM7.75 3a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5z">
            </path>
          </svg>
          ${user.company}
        </span>
      `
        : ''
      const locationSection = user.location
        ? `
      <span>
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" style="display: inline-block; fill: currentColor; vertical-align: text-bottom;">
          <path fill-rule="evenodd"
            d="M11.536 3.464a5 5 0 010 7.072L8 14.07l-3.536-3.535a5 5 0 117.072-7.072v.001zm1.06 8.132a6.5 6.5 0 10-9.192 0l3.535 3.536a1.5 1.5 0 002.122 0l3.535-3.536zM8 9a2 2 0 100-4 2 2 0 000 4z">
          </path>
        </svg>
        ${user.location}
      </span>
      `
        : ''

      userSection += `
      <table style="width: 100%; border-width: 0px; border-bottom-width: 1px; border-style: solid; border-color: #d0d7de; padding-top: 16px; padding-bottom: 16px;" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="width: 16.666667%; text-align: center; vertical-align: top;" valign="top">
            <a href="${user.url}" target="_blank" style="display: inline-block;">
              <img src="${user.avatarUrl}" alt="@${user.login}" width="50" height="50" style="max-width: 100%; line-height: 100%; border: 0; display: inline-block; border-radius: 50%; vertical-align: middle; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);">
            </a>
          </td>
          <td style="width: 83.333333%; padding-right: 8px; vertical-align: top;" valign="top">
            <a href="${user.url}" target="_blank" style="margin-top: 0; margin-bottom: 4px; display: inline-block; text-decoration: none;">
              ${nameSection}
              <span style="font-size: 14px; color: #57606a;">${user.login}</span>
            </a>
            ${bioSection}
            <p style="margin-top: 0; margin-bottom: 0; font-size: 12px; color: #57606a;">
              ${companySection}
              ${locationSection}
            </p>
          </td>
        </tr>
      </table>`
    }

    userSection += `</td></tr>`
  }

  return userSection
}

export function toHtml(
  githubContext: Context,
  snapshotAt: Date,
  totalCount: number,
  followers: Follower[],
  unfollowers: Follower[],
): string {
  const title = `You’ve got ${followers.length} new follower${
    followers.length > 1 ? 's' : ''
  } in last ${timeFromNow(snapshotAt)} 🎉`
  const unfollowerStat =
    unfollowers.length > 0
      ? `But ${unfollowers.length} user${
          unfollowers.length > 1 ? 's' : ''
        } unfollowed you 😢`
      : ''
  const totalStat = `Now you have ${totalCount} follower${
    totalCount > 1 ? 's' : ''
  } in total 🥳`

  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings xmlns:o="urn:schemas-microsoft-com:office:office">
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family: "Segoe UI", sans-serif; mso-line-height-rule: exactly;}
  </style>
  <![endif]-->
    <style>
.hover-underline:hover {
  text-decoration: underline !important;
}
@media (max-width: 600px) {
  .sm-w-full {
    width: 100% !important;
  }
  .sm-py-32 {
    padding-top: 32px !important;
    padding-bottom: 32px !important;
  }
  .sm-px-24 {
    padding-left: 24px !important;
    padding-right: 24px !important;
  }
  .sm-leading-32 {
    line-height: 32px !important;
  }
}
</style>
</head>
<body
  style="margin: 0; width: 100%; padding: 0; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #f3f4f6;">
  <div style="display: none;">${title}&#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
    &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
    &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
    &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
    &zwnj;
    &#160;&#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
    &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
    &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
    &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &zwnj;
    &#160;&#847; &#847; &#847; &#847; &#847; </div>
    <div role="article" aria-roledescription="email" aria-label="" lang="en">
    <table style="width: 100%; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;"
      cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="background-color: #f3f4f6;">
          <table class="sm-w-full" style="width: 600px;" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td class="sm-py-32 sm-px-24" style="padding: 40px; text-align: center;">
                <img src="https://github.githubassets.com/images/email/global/octocat-logo.png" width="48" alt="GitHub" style="max-width: 100%; vertical-align: middle; line-height: 100%; border: 0;">
              </td>
            </tr>
            <tr>
              <td class="sm-px-24" style="border-radius: 4px; background-color: #ffffff; padding: 48px; text-align: left; font-size: 16px; line-height: 24px;">
                <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td>
                      <p class="sm-leading-32" style="margin: 0; margin-bottom: 16px; font-size: 24px; font-weight: 600; color: #000000;">
                        ${title}
                      </p>
                      <p style="margin: 0; margin-bottom: 4px; color: #24292f;">
                        ${unfollowerStat}
                      </p>
                      <p style="margin: 0; margin-bottom: 20px; color: #24292f;">
                        ${totalStat}
                      </p>
                      <hr
                        style="margin-top: 0; margin-bottom: 0; height: 1px; border-width: 0px; background-color: #24292f; color: #24292f;">
                    </td>
                  </tr>

                  ${toUserSection(
                    `New follower${followers.length > 1 ? 's' : ''}`,
                    followers,
                  )}
                  ${toUserSection(
                    `Unfollower${unfollowers.length > 1 ? 's' : ''}`,
                    unfollowers,
                  )}

                  <tr>
                    <td style="padding-top: 36px; text-align: center;">
                      <a href="https://github.com/${
                        githubContext.repo.owner
                      }?tab=followers" target="_blank">
                        <img src="https://github.githubassets.com/images/email/sponsors/mona.png" width="150" alt="Drawing showing a GitHub octocat holding a heart" style="max-width: 100%; vertical-align: middle; line-height: 100%; border: 0;">
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="height: 40px;"></td>
            </tr>
            <tr>
              <td
                style="padding-left: 24px; padding-right: 24px; padding-bottom: 40px; text-align: center; font-size: 12px; color: #4b5563;">
                <p style="cursor: default;">
                  <a href="https://github.com/Sorosliu1029/follower-change" target="_blank" class="hover-underline"
                    style="color: #3b82f6; text-decoration: none;">
                    Powered by follower-change
                  </a> &bull;
                  <a href="https://github.com/Sorosliu1029" target="_blank" class="hover-underline"
                    style="color: #3b82f6; text-decoration: none;">
                    Created by Soros Liu with 🐈
                  </a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `
}
