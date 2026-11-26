---
title: "WPF File Dialog Improvements in .NET 8"
post_slug: "wpf-file-dialog-dotnet-8"
permalink: false
external_url: "https://devblogs.microsoft.com/dotnet/wpf-file-dialog-improvements-in-dotnet-8/"
external_site: "Microsoft .NET Blog"
tags: [".NET", "WPF", "C#", "API Design"]
description: "Designing and shipping OpenFolderDialog, CommonItemDialog, and modernized Win32 file dialog APIs in WPF for .NET 8."
readingtime: "6 min"
publishdate: "08-09-2023"
---

Official Microsoft .NET Blog announcement covering the design and delivery of native `OpenFolderDialog` support in WPF for .NET 8 — the most upvoted community API proposal in the `dotnet/wpf` repository (`dotnet/wpf#7689`).

Covers introducing `CommonItemDialog` into the dialog inheritance hierarchy to preserve binary and source compatibility, removing legacy pre-Vista `GetOpenFileName` / `GetSaveFileName` paths in favor of the modern Win32 Common Item Dialog COM API, and exposing new dialog configuration properties including `ClientGuid`, `AddToRecent`, `RootFolder`, and `DefaultDirectory`.
