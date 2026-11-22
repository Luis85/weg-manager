import type * as Obsidian from "obsidian";
import type { App } from "./app";
import type { Component } from "./component";
import type { EventRef, Events } from "./events";
import type { FileManager } from "./file-manager";
import type { MetadataCache } from "./metadata-cache";
import type { Plugin } from "./plugin";
import type { PluginSettingTab } from "./settings";
import type { TAbstractFile, TFile, TFolder, Vault } from "./vault";
import type { View, WorkspaceLeaf } from "./views";
import type { Workspace } from "./workspace";

/**
 * The compile-time check of the double against `node_modules/obsidian/obsidian.d.ts`. Each class
 * of the double declares `implements Uses<Obsidian.X, "the members the plugin uses">`, so a
 * member the plugin calls that is missing, or whose parameters or result differ from the real
 * one, fails the type check. `Doubled` reads a real signature with Obsidian's classes swapped for
 * the double's, so `getFileByPath(path: string): TFile | null` asks for the double's `TFile`.
 * Function types compare strictly (parameters contravariant). Overloaded members (`on`,
 * `registerDomEvent`, `setActiveLeaf`) are left out, because a mapped type sees only their last
 * overload, and so are protected ones (`View.onOpen`, `onClose`).
 */

/** True for `any`, which every conditional type would otherwise read as each of its branches. */
type IsAny<T> = 0 extends 1 & T ? true : false;

/** True when `A` and `B` are assignable both ways: an exact match even for an empty interface. */
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

type DoubledArgs<A extends readonly unknown[]> = { [I in keyof A]: Doubled<A[I]> };

/** `T` with Obsidian's classes, in parameters and results too, read as the double's. */
export type Doubled<T> =
  IsAny<T> extends true
    ? T
    : Same<T, Obsidian.EventRef> extends true
      ? EventRef
      : T extends Obsidian.TFile
        ? TFile
        : T extends Obsidian.TFolder
          ? TFolder
          : T extends Obsidian.TAbstractFile
            ? TAbstractFile
            : T extends Obsidian.WorkspaceLeaf
              ? WorkspaceLeaf
              : T extends Obsidian.View
                ? View
                : T extends Obsidian.PluginSettingTab
                  ? PluginSettingTab
                  : T extends Obsidian.Vault
                    ? Vault
                    : T extends Obsidian.MetadataCache
                      ? MetadataCache
                      : T extends Obsidian.FileManager
                        ? FileManager
                        : T extends Obsidian.Workspace
                          ? Workspace
                          : T extends Obsidian.App
                            ? App
                            : T extends Obsidian.Plugin
                              ? Plugin
                              : T extends Obsidian.Component
                                ? Component
                                : T extends Obsidian.Events
                                  ? Events
                                  : T extends Obsidian.Debouncer<infer A, infer V>
                                    ? Obsidian.Debouncer<A, V>
                                    : T extends abstract new (...args: infer A) => infer I
                                      ? abstract new (...args: A) => Doubled<I>
                                      : T extends Promise<infer U>
                                        ? Promise<Doubled<U>>
                                        : T extends (...args: infer A) => infer R
                                          ? (...args: DoubledArgs<A>) => Doubled<R>
                                          : T extends readonly (infer U)[]
                                            ? Doubled<U>[]
                                            : T;

/** The members `K` of Obsidian's `Real`, each read as `Doubled`. */
export type Uses<Real, K extends keyof Real> = { [P in K]: Doubled<Real[P]> };
