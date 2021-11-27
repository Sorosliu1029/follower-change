import { Context } from "@actions/github/lib/context"
import type { Follower } from "."

function timeFromNow(date: Date): string {
  const now = new Date()
  const dayDiff = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  )
  if (dayDiff > 0) {
    return `${dayDiff} day${dayDiff > 1 ? "s" : ""}`
  }

  const hourDiff = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60),
  )
  if (hourDiff > 0) {
    return `${hourDiff} hour${hourDiff > 1 ? "s" : ""}`
  }

  const minuteDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  if (minuteDiff > 0) {
    return `${minuteDiff} minute${minuteDiff > 1 ? "s" : ""}`
  }

  return "minute"
}

export function toMarkdown(
  githubContext: Context,
  snapshotAt: Date,
  totalCount: number,
  followers: Follower[],
  unfollowers: Follower[],
): string {
  let markdown = `## You"ve got ${followers.length} new follower${
    followers.length > 1 ? "s" : ""
  } in last ${timeFromNow(snapshotAt)} 🎉
  ${
    unfollowers.length
      ? `### But ${unfollowers.length} user${
          unfollowers.length > 1 ? "s" : ""
        } unfollowed you 😢`
      : ""
  }
  ### Now you have ${totalCount} followers in total 🥳`

  const userMarkdown = (follower: Follower) =>
    `- [${follower.name || follower.login}](${follower.url})`

  if (followers.length) {
    markdown += `\n## New followers\n${followers.map(userMarkdown).join("\n")}`
  } else if (unfollowers.length) {
    markdown += "\n## No new followers"
  }

  if (unfollowers.length) {
    markdown += `\n## Unfollowers\n${unfollowers.map(userMarkdown).join("\n")}`
  }

  return markdown
}

export function toPlainText(
  githubContext: Context,
  snapshotAt: Date,
  totalCount: number,
  followers: Follower[],
  unfollowers: Follower[],
): string {
  let text = `You"ve got ${followers.length} new follower${
    followers.length > 1 ? "s" : ""
  } in last ${timeFromNow(snapshotAt)} 🎉\n
  ${
    unfollowers.length
      ? `But ${unfollowers.length} user${
          unfollowers.length > 1 ? "s" : ""
        } unfollowed you 😢\n`
      : ""
  }
  Now you have ${totalCount} followers in total 🥳\n`

  const userText = (follower: Follower) =>
    `- ${follower.name || follower.login} (${follower.url})`

  if (followers.length) {
    text += `\nNew followers:\n${followers.map(userText).join("\n")}`
  } else if (unfollowers.length) {
    text += "\nNo new followers"
  }

  if (unfollowers.length) {
    text += `\nUnfollowers:\n${unfollowers.map(userText).join("\n")}`
  }

  return text
}

export function toHtml(
  githubContext: Context,
  snapshotAt: Date,
  totalCount: number,
  followers: Follower[],
  unfollowers: Follower[],
): string {
  const titleSection = `
  <!-- title -->
  <table border="0" cellspacing="0" cellpadding="0" align="left" width="100%"
    style="box-sizing: border-box; border-spacing: 0; border-collapse: collapse; max-width: 768px; margin-right: auto; margin-left: auto; margin-top: 16px; margin-bottom: 16px; width: 100% !important;">
    <tr style="box-sizing: border-box;">
      <td align="left" style="box-sizing: border-box; padding: 0; text-align: left !important;">
        <img src="https://github.githubassets.com/images/email/global/octocat-logo.png" alt="GitHub" width="32"
          style="box-sizing: border-box; border: none;" />
        <h2
          style="box-sizing: border-box; margin-top: 8px !important; margin-bottom: 0; font-size: 24px; font-weight: 400 !important; line-height: 1.25 !important;">
          You’ve got ${followers.length} new follower${
    followers.length > 1 ? "s" : ""
  } in last ${timeFromNow(snapshotAt)} 🎉
        </h2>
        ${
          unfollowers.length
            ? `<h3
          style="box-sizing: border-box; margin-top: 8px !important; margin-bottom: 0; font-size: 18px; font-weight: 400 !important; line-height: 1.25 !important;">
          But ${unfollowers.length} user${
                unfollowers.length > 1 ? "s" : ""
              } unfollowed you 😢
        </h3>`
            : ""
        }
        <h3
          style="box-sizing: border-box; margin-top: 8px !important; margin-bottom: 0; font-size: 18px; font-weight: 400 !important; line-height: 1.25 !important;">
          Now you have ${totalCount} followers in total 🥳
        </h3>
      </td>
    </tr>
  </table>
  `
  const userHtml = (
    follower: Follower,
    index: number,
    allFollowers: Follower[],
  ) =>
    `
    <table width="100%"
      style="box-sizing: border-box; border-spacing: 0; border-collapse: collapse; ${
        index < allFollowers.length - 1
          ? "border-bottom: 1px solid #d0d7de !important;"
          : ""
      }  width: 100% !important;">
      <tr style="box-sizing: border-box;">
        <td style="box-sizing: border-box; vertical-align: top; padding-top: 8px;">
          <a href="${follower.url}">
            <img src="${follower.avatarUrl}" width="50" height="50"
              style="border-radius: 50% !important;" alt="@${follower.login}">
          </a>
        </td>
        <td align="left">
          <a href="${
            follower.url
          }" style="text-decoration: none !important; margin-bottom: 4px !important; margin-top: 8px;
          display: inline-block;">
            ${
              follower.name
                ? `<span style="font-size: 16px !important; color: #24292f">${follower.name}</span>`
                : ""
            }
            <span style="padding-left: 4px !important; font-size: 14px; color: #57606a">${
              follower.login
            }</span>
          </a>

          ${
            follower.bio
              ? `<div style="font-size: 12px !important; color: #57606a">
            <div>${follower.bio}</div>
          </div>`
              : ""
          }

          <p style="font-size: 12px !important; color: #57606a">
            ${
              follower.company
                ? `<span style="margin-right: 16px !important;">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16"
                data-view-component="true" style="vertical-align: text-bottom; fill: currentColor">
                <path fill-rule="evenodd"
                  d="M1.5 14.25c0 .138.112.25.25.25H4v-1.25a.75.75 0 01.75-.75h2.5a.75.75 0 01.75.75v1.25h2.25a.25.25 0 00.25-.25V1.75a.25.25 0 00-.25-.25h-8.5a.25.25 0 00-.25.25v12.5zM1.75 16A1.75 1.75 0 010 14.25V1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 00.25-.25V8.285a.25.25 0 00-.111-.208l-1.055-.703a.75.75 0 11.832-1.248l1.055.703c.487.325.779.871.779 1.456v5.965A1.75 1.75 0 0114.25 16h-3.5a.75.75 0 01-.197-.026c-.099.017-.2.026-.303.026h-3a.75.75 0 01-.75-.75V14h-1v1.25a.75.75 0 01-.75.75h-3zM3 3.75A.75.75 0 013.75 3h.5a.75.75 0 010 1.5h-.5A.75.75 0 013 3.75zM3.75 6a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM3 9.75A.75.75 0 013.75 9h.5a.75.75 0 010 1.5h-.5A.75.75 0 013 9.75zM7.75 9a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM7 6.75A.75.75 0 017.75 6h.5a.75.75 0 010 1.5h-.5A.75.75 0 017 6.75zM7.75 3a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5z">
                </path>
              </svg> ${follower.company}
            </span>`
                : ""
            }
            ${
              follower.location
                ? `<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16"
              data-view-component="true" style="vertical-align: text-bottom; fill: currentColor">
              <path fill-rule="evenodd"
                d="M11.536 3.464a5 5 0 010 7.072L8 14.07l-3.536-3.535a5 5 0 117.072-7.072v.001zm1.06 8.132a6.5 6.5 0 10-9.192 0l3.535 3.536a1.5 1.5 0 002.122 0l3.535-3.536zM8 9a2 2 0 100-4 2 2 0 000 4z">
              </path>
            </svg> ${follower.location}`
                : ""
            }
          </p>

        </td>
      </tr>
    </table>`

  let followerSection = `
  <!-- follower list -->
  <table width="100%"
    style="box-sizing: border-box; border-spacing: 0; border-collapse: collapse; width: 100% !important;">`

  if (followers.length) {
    followerSection += `<!-- new followers -->
    <tr>
      <td align="left">
        <h2
          style="box-sizing: border-box; margin-top: 12px !important; font-size: 21px; font-weight: 400 !important; line-height: 1.25 !important;">
          New followers</h2>
      </td>
    </tr>
    <tr style="box-sizing: border-box;">
      <td
        style="box-sizing: border-box; border-radius: 6px !important; display: block !important; padding: 0; border: 1px solid #e1e4e8;">
        ${followers.map(userHtml).join("")}</td></tr>`
  } else if (unfollowers.length) {
    followerSection += `<!-- new followers -->
    <tr>
      <td align="left">
        <h2
          style="box-sizing: border-box; margin-top: 12px !important; font-size: 21px; font-weight: 400 !important; line-height: 1.25 !important;">
          No new followers</h2>
      </td>
    </tr>`
  }

  if (unfollowers.length) {
    followerSection += `<!-- unfollowers -->
    <tr>
      <td align="left">
        <h2
          style="box-sizing: border-box; margin-top: 24px !important; font-size: 21px; font-weight: 400 !important; line-height: 1.25 !important;">
          Unfollowers</h2>
      </td>
    </tr>
    <tr style="box-sizing: border-box;">
      <td
        style="box-sizing: border-box; border-radius: 6px !important; display: block !important; padding: 0; border: 1px solid #e1e4e8;">
        ${unfollowers.map(userHtml).join("")}</td></tr>`
  }

  followerSection += `
  <!-- github heart -->
    <tr
      style="box-sizing: border-box;">
      <td align="center"
        style="box-sizing: border-box; padding: 28px;">
        <img src="https://github.githubassets.com/images/email/sponsors/mona.png" width="150"
          alt="Drawing showing a GitHub octocat holding a heart"
          href="https://github.com/${githubContext.repo.owner}?tab=followers"/>
      </td>
    </tr>
  </table>`

  return `
<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en"
  style="font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; box-sizing: border-box;"
  xml:lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>You"ve got ${followers.length} new follower${
    followers.length > 1 ? "s" : ""
  }</title>
</head>  

<body
  style="box-sizing: border-box; font-size: 14px; line-height: 1.5; color: #24292e; background-color: #fff; margin: 0;"
  bgcolor="#fff">
  <table align="center" width="100%"
    style="box-sizing: border-box; border-spacing: 0; border-collapse: collapse; max-width: 544px; margin-right: auto; margin-left: auto; width: 100% !important;">
    <tr style="box-sizing: border-box;">
      <td align="center" valign="top" style="box-sizing: border-box; padding: 16px;">
        <div style="box-sizing: border-box; text-align: center;">
          ${titleSection}
          ${followerSection}
          <!-- github action info -->
          <table border="0" cellspacing="0" cellpadding="0" align="center" width="100%"
            style="box-sizing: border-box; border-spacing: 0; border-collapse: collapse; width: 100% !important; text-align: center !important; margin-top: 16px; margin-bottom: 16px;">
            <tr style="box-sizing: border-box;">
              <td align="center" style="box-sizing: border-box; padding: 0;">
                <p style="box-sizing: border-box; margin-top: 0; margin-bottom: 10px; font-size: 12px !important;">
                  <a href="https://github.com/Sorosliu1029/follower-change"
                    style="background-color: transparent; box-sizing: border-box; color: #0366d6; text-decoration: none; display: inline-block !important;">Powered by follower-change</a> &#12539;
                  <a href="https://github.com/Sorosliu1029"
                    style="background-color: transparent; box-sizing: border-box; color: #0366d6; text-decoration: none; display: inline-block !important;">Created by Soros Liu with ❤️️ </a>
                </p>
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
  </table>
  <!-- prevent Gmail on iOS font size manipulation -->
  <div style="display: none; white-space: nowrap; box-sizing: border-box; font-size: 15px; line-height: 0;">
    &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160;
    &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; </div>
</body>

</html>
`
}
