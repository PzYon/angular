/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {DEFAULT_ERROR_CODE, Diagnostic, SOURCE} from './api';

export const GENERATED_FILES = /(.*?)\.(ngfactory|shim\.ngstyle|ngstyle|ngsummary)\.(js|d\.ts|ts)$/;

export function error(msg: string): never {
  throw new Error(`Internal error: ${msg}`);
}

export function createMessageDiagnostic(messageText: string): ts.Diagnostic&Diagnostic {
  return {
    file: undefined,
    start: undefined,
    length: undefined,
    category: ts.DiagnosticCategory.Message,
    messageText,
    code: DEFAULT_ERROR_CODE,
    source: SOURCE,
  };
}

/**
 * Converts a ng.Diagnostic into a ts.Diagnostic.
 * This looses some information, and also uses an incomplete object as `file`.
 *
 * I.e. only use this where the API allows only a ts.Diagnostic.
 */
export function ngToTsDiagnostic(ng: Diagnostic): ts.Diagnostic {
  let file: ts.SourceFile|undefined;
  let start: number|undefined;
  let length: number|undefined;
  if (ng.span) {
    // Note: We can't use a real ts.SourceFile,
    // but we can at least mirror the properties `fileName` and `text`, which
    // are mostly used for error reporting.
    file = {fileName: ng.span.start.file.url, text: ng.span.start.file.content} as ts.SourceFile;
    start = ng.span.start.offset;
    length = ng.span.end.offset - start;
  }
  return {
    file,
    messageText: ng.messageText,
    category: ng.category,
    code: ng.code,
    start,
    length,
  };
}
