import * as cookie from 'cookie';
import * as s from 'superstruct';
import path$1 from 'node:path';
import fs$1 from 'node:fs/promises';
import fs from 'fs/promises';
import path from 'path';
import { parse, nodes } from '@markdoc/markdoc/dist/index.mjs';
import { assertNever as assertNever$1 } from 'emery/assertions';
import { assertNever, assert, isString } from 'emery';
import { jsx, jsxs } from 'react/jsx-runtime';
import { createHash } from 'crypto';
import { sanitizeUrl } from '@braintree/sanitize-url';
import ignore from 'ignore';
import { webcrypto, randomBytes } from 'node:crypto';
import { parseString } from 'set-cookie-parser';
export { renderers } from '../../../renderers.mjs';

class FieldDataError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FieldDataError';
  }
}

function assertRequired(value, validation, label) {
  if (value === null && validation !== null && validation !== void 0 && validation.isRequired) {
    throw new FieldDataError(`${label} is required`);
  }
}
function basicFormFieldWithSimpleReaderParse(config) {
  return {
    kind: 'form',
    Input: config.Input,
    defaultValue: config.defaultValue,
    parse: config.parse,
    serialize: config.serialize,
    validate: config.validate,
    reader: {
      parse(value) {
        return config.validate(config.parse(value));
      }
    },
    label: config.label
  };
}

// this is used in react-server environments to avoid bundling UI when the reader API is used
// if you added a new field and get an error that there's missing a missing export here,
// you probably just need to add another empty export here

function empty$1() {
  throw new Error("unexpected call to function that shouldn't be called in React server component environment");
}
let SlugFieldInput = empty$1,
  TextFieldInput = empty$1,
  UrlFieldInput = empty$1,
  SelectFieldInput = empty$1,
  RelationshipInput = empty$1,
  PathReferenceInput = empty$1,
  MultiselectFieldInput = empty$1,
  MultiRelationshipInput = empty$1,
  IntegerFieldInput = empty$1,
  NumberFieldInput = empty$1,
  ImageFieldInput = empty$1,
  FileFieldInput = empty$1,
  DatetimeFieldInput = empty$1,
  DateFieldInput = empty$1,
  CloudImageFieldInput = empty$1,
  BlocksFieldInput = empty$1,
  DocumentFieldInput = empty$1,
  CheckboxFieldInput = empty$1,
  createEditorSchema = empty$1,
  getDefaultValue = empty$1,
  parseToEditorState = empty$1,
  serializeFromEditorState = empty$1,
  parseToEditorStateMDX = empty$1,
  serializeFromEditorStateMDX = empty$1,
  createEditorStateFromYJS = empty$1,
  prosemirrorToYXmlFragment = empty$1,
  normalizeDocumentFieldChildren = empty$1,
  slugify = empty$1,
  serializeMarkdoc = empty$1;

function validateText(val, min, max, fieldLabel, slugInfo, pattern) {
  if (val.length < min) {
    if (min === 1) {
      return `${fieldLabel} must not be empty`;
    } else {
      return `${fieldLabel} must be at least ${min} characters long`;
    }
  }
  if (val.length > max) {
    return `${fieldLabel} must be no longer than ${max} characters`;
  }
  if (pattern && !pattern.regex.test(val)) {
    return pattern.message || `${fieldLabel} must match the pattern ${pattern.regex}`;
  }
  if (slugInfo) {
    if (val === '') {
      return `${fieldLabel} must not be empty`;
    }
    if (val === '..') {
      return `${fieldLabel} must not be ..`;
    }
    if (val === '.') {
      return `${fieldLabel} must not be .`;
    }
    if (slugInfo.glob === '**') {
      const split = val.split('/');
      if (split.some(s => s === '..')) {
        return `${fieldLabel} must not contain ..`;
      }
      if (split.some(s => s === '.')) {
        return `${fieldLabel} must not be .`;
      }
    }
    if ((slugInfo.glob === '*' ? /[\\/]/ : /[\\]/).test(val)) {
      return `${fieldLabel} must not contain slashes`;
    }
    if (/^\s|\s$/.test(val)) {
      return `${fieldLabel} must not start or end with spaces`;
    }
    if (slugInfo.slugs.has(val)) {
      return `${fieldLabel} must be unique`;
    }
  }
}

function parseAsNormalField(value) {
  if (value === undefined) {
    return '';
  }
  if (typeof value !== 'string') {
    throw new FieldDataError('Must be a string');
  }
  return value;
}
const emptySet = new Set();
function text({
  label,
  defaultValue = '',
  validation: {
    length: {
      max = Infinity,
      min = 0
    } = {},
    pattern,
    isRequired
  } = {},
  description,
  multiline = false
}) {
  min = Math.max(isRequired ? 1 : 0, min);
  function validate(value, slugField) {
    const message = validateText(value, min, max, label, slugField, pattern);
    if (message !== undefined) {
      throw new FieldDataError(message);
    }
    return value;
  }
  return {
    kind: 'form',
    formKind: 'slug',
    label,
    Input(props) {
      return /*#__PURE__*/jsx(TextFieldInput, {
        label: label,
        description: description,
        min: min,
        max: max,
        multiline: multiline,
        pattern: pattern,
        ...props
      });
    },
    defaultValue() {
      return typeof defaultValue === 'string' ? defaultValue : defaultValue();
    },
    parse(value, args) {
      if ((args === null || args === void 0 ? void 0 : args.slug) !== undefined) {
        return args.slug;
      }
      return parseAsNormalField(value);
    },
    serialize(value) {
      return {
        value: value === '' ? undefined : value
      };
    },
    serializeWithSlug(value) {
      return {
        slug: value,
        value: undefined
      };
    },
    reader: {
      parse(value) {
        const parsed = parseAsNormalField(value);
        return validate(parsed, undefined);
      },
      parseWithSlug(_value, args) {
        validate(parseAsNormalField(args.slug), {
          glob: args.glob,
          slugs: emptySet
        });
        return null;
      }
    },
    validate(value, args) {
      return validate(value, args === null || args === void 0 ? void 0 : args.slugField);
    }
  };
}

function object(fields, opts) {
  return {
    ...opts,
    kind: 'object',
    fields
  };
}

function getValueAtPropPath(value, inputPath) {
  const path = [...inputPath];
  while (path.length) {
    const key = path.shift();
    value = value[key];
  }
  return value;
}
function transformProps(schema, value, visitors, path = []) {
  if (schema.kind === 'form' || schema.kind === 'child') {
    if (visitors[schema.kind]) {
      return visitors[schema.kind](schema, value, path);
    }
    return value;
  }
  if (schema.kind === 'object') {
    const val = Object.fromEntries(Object.entries(schema.fields).map(([key, val]) => {
      return [key, transformProps(val, value[key], visitors, [...path, key])];
    }));
    if (visitors.object) {
      return visitors[schema.kind](schema, val, path);
    }
    return val;
  }
  if (schema.kind === 'array') {
    const val = value.map((val, idx) => transformProps(schema.element, val, visitors, path.concat(idx)));
    if (visitors.array) {
      return visitors[schema.kind](schema, val, path);
    }
    return val;
  }
  if (schema.kind === 'conditional') {
    const discriminant = transformProps(schema.discriminant, value.discriminant, visitors, path.concat('discriminant'));
    const conditionalVal = transformProps(schema.values[discriminant.toString()], value.value, visitors, path.concat('value'));
    const val = {
      discriminant,
      value: conditionalVal
    };
    if (visitors.conditional) {
      return visitors[schema.kind](schema, val, path);
    }
    return val;
  }
  assertNever$1(schema);
}

// a v important note
// marks in the markdown ast/html are represented quite differently to how they are in slate
// if you had the markdown **something https://keystonejs.com something**
// the bold node is the parent of the link node
// but in slate, marks are only represented on text nodes

const currentlyActiveMarks = new Set();
const currentlyDisabledMarks = new Set();
let currentLink = null;
function addMarkToChildren(mark, cb) {
  const wasPreviouslyActive = currentlyActiveMarks.has(mark);
  currentlyActiveMarks.add(mark);
  try {
    return cb();
  } finally {
    if (!wasPreviouslyActive) {
      currentlyActiveMarks.delete(mark);
    }
  }
}
function setLinkForChildren(href, cb) {
  // we'll only use the outer link
  if (currentLink !== null) {
    return cb();
  }
  currentLink = href;
  try {
    return cb();
  } finally {
    currentLink = null;
  }
}

/**
 * This type is more strict than `Element & { type: 'link'; }` because `children`
 * is constrained to only contain Text nodes. This can't be assumed generally around the editor
 * (because of potentially future inline components or nested links(which are normalized away but the editor needs to not break if it happens))
 * but where this type is used, we're only going to allow links to contain Text and that's important
 * so that we know a block will never be inside an inline because Slate gets unhappy when that happens
 * (really the link inline should probably be a mark rather than an inline,
 * non-void inlines are probably always bad but that would imply changing the document
 * structure which would be such unnecessary breakage)
 */

function getInlineNodes(text) {
  const node = {
    text
  };
  for (const mark of currentlyActiveMarks) {
    if (!currentlyDisabledMarks.has(mark)) {
      node[mark] = true;
    }
  }
  if (currentLink !== null) {
    return [{
      text: ''
    }, {
      type: 'link',
      href: currentLink,
      children: [node]
    }, {
      text: ''
    }];
  }
  return [node];
}

class VariableChildFields extends Error {
  constructor() {
    super('There are a variable number of child fields');
  }
}
function findSingleChildField(schema) {
  try {
    const result = _findConstantChildFields(schema, [], new Set());
    if (result.length === 1) {
      return result[0];
    }
    return;
  } catch (err) {
    if (err instanceof VariableChildFields) {
      return;
    }
    throw err;
  }
}
function _findConstantChildFields(schema, path, seenSchemas) {
  if (seenSchemas.has(schema)) {
    return [];
  }
  seenSchemas.add(schema);
  switch (schema.kind) {
    case 'form':
      return [];
    case 'child':
      return [{
        relativePath: path,
        options: schema.options,
        kind: 'child'
      }];
    case 'conditional':
      {
        if (couldContainChildField(schema)) {
          throw new VariableChildFields();
        }
        return [];
      }
    case 'array':
      {
        if (schema.asChildTag) {
          const child = _findConstantChildFields(schema.element, [], seenSchemas);
          if (child.length > 1) {
            return [];
          }
          return [{
            kind: 'array',
            asChildTag: schema.asChildTag,
            field: schema,
            relativePath: path,
            child: child[0]
          }];
        }
        if (couldContainChildField(schema)) {
          throw new VariableChildFields();
        }
        return [];
      }
    case 'object':
      {
        const paths = [];
        for (const [key, value] of Object.entries(schema.fields)) {
          paths.push(..._findConstantChildFields(value, path.concat(key), seenSchemas));
        }
        return paths;
      }
  }
}
function couldContainChildField(schema, seen = new Set()) {
  if (seen.has(schema)) {
    return false;
  }
  seen.add(schema);
  switch (schema.kind) {
    case 'form':
      return false;
    case 'child':
      return true;
    case 'conditional':
      return Object.values(schema.values).some(value => couldContainChildField(value, seen));
    case 'object':
      return Object.keys(schema.fields).some(key => couldContainChildField(schema.fields[key], seen));
    case 'array':
      return couldContainChildField(schema.element, seen);
  }
}

function inlineNodeFromMarkdoc(node) {
  if (node.type === 'inline') {
    return inlineChildrenFromMarkdoc(node.children);
  }
  if (node.type === 'link') {
    return setLinkForChildren(node.attributes.href, () => inlineChildrenFromMarkdoc(node.children));
  }
  if (node.type === 'text') {
    return getInlineNodes(node.attributes.content);
  }
  if (node.type === 'strong') {
    return addMarkToChildren('bold', () => inlineChildrenFromMarkdoc(node.children));
  }
  if (node.type === 'code') {
    return addMarkToChildren('code', () => getInlineNodes(node.attributes.content));
  }
  if (node.type === 'em') {
    return addMarkToChildren('italic', () => inlineChildrenFromMarkdoc(node.children));
  }
  if (node.type === 's') {
    return addMarkToChildren('strikethrough', () => inlineChildrenFromMarkdoc(node.children));
  }
  if (node.type === 'tag') {
    if (node.tag === 'u') {
      return addMarkToChildren('underline', () => inlineChildrenFromMarkdoc(node.children));
    }
    if (node.tag === 'kbd') {
      return addMarkToChildren('keyboard', () => inlineChildrenFromMarkdoc(node.children));
    }
    if (node.tag === 'sub') {
      return addMarkToChildren('subscript', () => inlineChildrenFromMarkdoc(node.children));
    }
    if (node.tag === 'sup') {
      return addMarkToChildren('superscript', () => inlineChildrenFromMarkdoc(node.children));
    }
  }
  if (node.type === 'softbreak') {
    return getInlineNodes(' ');
  }
  if (node.type === 'hardbreak') {
    return getInlineNodes('\n');
  }
  if (node.tag === 'component-inline-prop' && Array.isArray(node.attributes.propPath) && node.attributes.propPath.every(x => typeof x === 'string' || typeof x === 'number')) {
    return {
      type: 'component-inline-prop',
      children: inlineFromMarkdoc(node.children),
      propPath: node.attributes.propPath
    };
  }
  throw new Error(`Unknown inline node type: ${node.type}`);
}
function inlineChildrenFromMarkdoc(nodes) {
  return nodes.flatMap(inlineNodeFromMarkdoc);
}
function inlineFromMarkdoc(nodes) {
  const transformedNodes = nodes.flatMap(inlineNodeFromMarkdoc);
  const nextNodes = [];
  let lastNode;
  for (const [idx, node] of transformedNodes.entries()) {
    var _lastNode;
    if (node.type === undefined && node.text === '' && ((_lastNode = lastNode) === null || _lastNode === void 0 ? void 0 : _lastNode.type) === undefined && idx !== transformedNodes.length - 1) {
      continue;
    }
    nextNodes.push(node);
    lastNode = node;
  }
  if (!nextNodes.length) {
    nextNodes.push({
      text: ''
    });
  }
  return nextNodes;
}
function fromMarkdoc(node, componentBlocks) {
  const nodes = node.children.flatMap(x => fromMarkdocNode(x, componentBlocks));
  if (nodes.length === 0) {
    return [{
      type: 'paragraph',
      children: [{
        text: ''
      }]
    }];
  }
  if (nodes[nodes.length - 1].type !== 'paragraph') {
    nodes.push({
      type: 'paragraph',
      children: [{
        text: ''
      }]
    });
  }
  return nodes;
}
function fromMarkdocNode(node, componentBlocks) {
  if (node.type === 'blockquote') {
    return {
      type: 'blockquote',
      children: node.children.flatMap(x => fromMarkdocNode(x, componentBlocks))
    };
  }
  if (node.type === 'fence') {
    const {
      language,
      content,
      ...rest
    } = node.attributes;
    return {
      type: 'code',
      children: [{
        text: content.replace(/\n$/, '')
      }],
      ...(typeof language === 'string' ? {
        language
      } : {}),
      ...rest
    };
  }
  if (node.type === 'heading') {
    return {
      ...node.attributes,
      level: node.attributes.level,
      type: 'heading',
      children: inlineFromMarkdoc(node.children)
    };
  }
  if (node.type === 'list') {
    return {
      type: node.attributes.ordered ? 'ordered-list' : 'unordered-list',
      children: node.children.flatMap(x => fromMarkdocNode(x, componentBlocks))
    };
  }
  if (node.type === 'item') {
    var _node$children$;
    const children = [{
      type: 'list-item-content',
      children: node.children.length ? inlineFromMarkdoc([node.children[0]]) : [{
        text: ''
      }]
    }];
    if (((_node$children$ = node.children[1]) === null || _node$children$ === void 0 ? void 0 : _node$children$.type) === 'list') {
      const list = node.children[1];
      children.push({
        type: list.attributes.ordered ? 'ordered-list' : 'unordered-list',
        children: list.children.flatMap(x => fromMarkdocNode(x, componentBlocks))
      });
    }
    return {
      type: 'list-item',
      children
    };
  }
  if (node.type === 'paragraph') {
    if (node.children.length === 1 && node.children[0].type === 'inline' && node.children[0].children.length === 1 && node.children[0].children[0].type === 'image') {
      var _image$attributes$tit;
      const image = node.children[0].children[0];
      return {
        type: 'image',
        src: decodeURI(image.attributes.src),
        alt: image.attributes.alt,
        title: (_image$attributes$tit = image.attributes.title) !== null && _image$attributes$tit !== void 0 ? _image$attributes$tit : '',
        children: [{
          text: ''
        }]
      };
    }
    const children = inlineFromMarkdoc(node.children);
    if (children.length === 1 && children[0].type === 'component-inline-prop') {
      return children[0];
    }
    return {
      type: 'paragraph',
      children,
      textAlign: node.attributes.textAlign
    };
  }
  if (node.type === 'hr') {
    return {
      type: 'divider',
      children: [{
        text: ''
      }]
    };
  }
  if (node.type === 'table') {
    return {
      type: 'table',
      children: node.children.flatMap(x => fromMarkdocNode(x, componentBlocks))
    };
  }
  if (node.type === 'tbody') {
    return {
      type: 'table-body',
      children: node.children.flatMap(x => fromMarkdocNode(x, componentBlocks))
    };
  }
  if (node.type === 'thead') {
    if (!node.children.length) return [];
    return {
      type: 'table-head',
      children: node.children.flatMap(x => fromMarkdocNode(x, componentBlocks))
    };
  }
  if (node.type === 'tr') {
    return {
      type: 'table-row',
      children: node.children.flatMap(x => fromMarkdocNode(x, componentBlocks))
    };
  }
  if (node.type === 'td') {
    return {
      type: 'table-cell',
      children: node.children.flatMap(x => fromMarkdocNode(x, componentBlocks))
    };
  }
  if (node.type === 'th') {
    return {
      type: 'table-cell',
      header: true,
      children: node.children.flatMap(x => fromMarkdocNode(x, componentBlocks))
    };
  }
  if (node.type === 'tag') {
    if (node.tag === 'table') {
      return fromMarkdocNode(node.children[0], componentBlocks);
    }
    if (node.tag === 'layout') {
      return {
        type: 'layout',
        layout: node.attributes.layout,
        children: node.children.flatMap(x => fromMarkdocNode(x, componentBlocks))
      };
    }
    if (node.tag === 'layout-area') {
      return {
        type: 'layout-area',
        children: node.children.flatMap(x => fromMarkdocNode(x, componentBlocks))
      };
    }
    if (node.tag === 'component-block') {
      return {
        type: 'component-block',
        component: node.attributes.component,
        props: node.attributes.props,
        children: node.children.length === 0 ? [{
          type: 'component-inline-prop',
          children: [{
            text: ''
          }]
        }] : node.children.flatMap(x => fromMarkdocNode(x, componentBlocks))
      };
    }
    if (node.tag === 'component-block-prop' && Array.isArray(node.attributes.propPath) && node.attributes.propPath.every(x => typeof x === 'string' || typeof x === 'number')) {
      return {
        type: 'component-block-prop',
        children: node.children.flatMap(x => fromMarkdocNode(x, componentBlocks)),
        propPath: node.attributes.propPath
      };
    }
    if (node.tag) {
      const componentBlock = componentBlocks[node.tag];
      if (componentBlock) {
        const singleChildField = findSingleChildField({
          kind: 'object',
          fields: componentBlock.schema
        });
        if (singleChildField) {
          const newAttributes = JSON.parse(JSON.stringify(node.attributes));
          const children = [];
          toChildrenAndProps(node.children, children, newAttributes, singleChildField, [], componentBlocks);
          return {
            type: 'component-block',
            component: node.tag,
            props: newAttributes,
            children
          };
        }
        return {
          type: 'component-block',
          component: node.tag,
          props: node.attributes,
          children: node.children.length === 0 ? [{
            type: 'component-inline-prop',
            children: [{
              text: ''
            }]
          }] : node.children.flatMap(x => fromMarkdocNode(x, componentBlocks))
        };
      }
    }
    throw new Error(`Unknown tag: ${node.tag}`);
  }
  return inlineNodeFromMarkdoc(node);
}
function toChildrenAndProps(fromMarkdoc, resultingChildren, value, singleChildField, parentPropPath, componentBlocks) {
  if (singleChildField.kind === 'child') {
    const children = fromMarkdoc.flatMap(x => fromMarkdocNode(x, componentBlocks));
    resultingChildren.push({
      type: `component-${singleChildField.options.kind}-prop`,
      propPath: [...parentPropPath, ...singleChildField.relativePath],
      children
    });
  }
  if (singleChildField.kind === 'array') {
    const arr = [];
    for (let [idx, child] of fromMarkdoc.entries()) {
      if (child.type === 'paragraph') {
        child = child.children[0].children[0];
      }
      if (child.type !== 'tag') {
        throw new Error(`expected tag ${singleChildField.asChildTag}, found type: ${child.type}`);
      }
      if (child.tag !== singleChildField.asChildTag) {
        throw new Error(`expected tag ${singleChildField.asChildTag}, found tag: ${child.tag}`);
      }
      const attributes = JSON.parse(JSON.stringify(child.attributes));
      if (singleChildField.child) {
        toChildrenAndProps(child.children, resultingChildren, attributes, singleChildField.child, [...parentPropPath, ...singleChildField.relativePath, idx], componentBlocks);
      }
      arr.push(attributes);
    }
    const key = singleChildField.relativePath[singleChildField.relativePath.length - 1];
    const parent = getValueAtPropPath(value, singleChildField.relativePath.slice(0, -1));
    parent[key] = arr;
  }
}

// these are intentionally more restrictive than the types allowed by strong and weak maps

const emptyCacheNode = Symbol('emptyCacheNode');

// weak keys should always come before strong keys in the arguments though that cannot be enforced with types
function memoize(func) {
  const cacheNode = {
    value: emptyCacheNode,
    strong: undefined,
    weak: undefined
  };
  return (...args) => {
    let currentCacheNode = cacheNode;
    for (const arg of args) {
      if (typeof arg === 'string' || typeof arg === 'number') {
        if (currentCacheNode.strong === undefined) {
          currentCacheNode.strong = new Map();
        }
        if (!currentCacheNode.strong.has(arg)) {
          currentCacheNode.strong.set(arg, {
            value: emptyCacheNode,
            strong: undefined,
            weak: undefined
          });
        }
        currentCacheNode = currentCacheNode.strong.get(arg);
        continue;
      }
      if (typeof arg === 'object') {
        if (currentCacheNode.weak === undefined) {
          currentCacheNode.weak = new WeakMap();
        }
        if (!currentCacheNode.weak.has(arg)) {
          currentCacheNode.weak.set(arg, {
            value: emptyCacheNode,
            strong: undefined,
            weak: undefined
          });
        }
        currentCacheNode = currentCacheNode.weak.get(arg);
        continue;
      }
    }
    if (currentCacheNode.value !== emptyCacheNode) {
      return currentCacheNode.value;
    }
    const result = func(...args);
    currentCacheNode.value = result;
    return result;
  };
}

function fixPath(path) {
  return path.replace(/^\.?\/+/, '').replace(/\/*$/, '');
}
const collectionPath = /\/\*\*?(?:$|\/)/;
function getConfiguredCollectionPath(config, collection) {
  var _collectionConfig$pat;
  const collectionConfig = config.collections[collection];
  const path = (_collectionConfig$pat = collectionConfig.path) !== null && _collectionConfig$pat !== void 0 ? _collectionConfig$pat : `${collection}/*/`;
  if (!collectionPath.test(path)) {
    throw new Error(`Collection path must end with /* or /** or include /*/ or /**/ but ${collection} has ${path}`);
  }
  return path;
}
function getCollectionPath(config, collection) {
  const configuredPath = getConfiguredCollectionPath(config, collection);
  const path = fixPath(configuredPath.replace(/\*\*?.*$/, ''));
  return path;
}
function getSingletonFormat(config, singleton) {
  return getFormatInfo(config, 'singletons', singleton);
}
function getSingletonPath(config, singleton) {
  var _singleton$path, _singleton$path2;
  if ((_singleton$path = config.singletons[singleton].path) !== null && _singleton$path !== void 0 && _singleton$path.includes('*')) {
    throw new Error(`Singleton paths cannot include * but ${singleton} has ${config.singletons[singleton].path}`);
  }
  return fixPath((_singleton$path2 = config.singletons[singleton].path) !== null && _singleton$path2 !== void 0 ? _singleton$path2 : singleton);
}
function getDataFileExtension(formatInfo) {
  return formatInfo.contentField ? formatInfo.contentField.contentExtension : '.' + formatInfo.data;
}
const getFormatInfo = memoize(_getFormatInfo);
function _getFormatInfo(config, type, key) {
  var _collectionOrSingleto, _format$data;
  const collectionOrSingleton = type === 'collections' ? config.collections[key] : config.singletons[key];
  const path = type === 'collections' ? getConfiguredCollectionPath(config, key) : (_collectionOrSingleto = collectionOrSingleton.path) !== null && _collectionOrSingleto !== void 0 ? _collectionOrSingleto : `${key}/`;
  const dataLocation = path.endsWith('/') ? 'index' : 'outer';
  const {
    schema,
    format = 'yaml'
  } = collectionOrSingleton;
  if (typeof format === 'string') {
    return {
      dataLocation,
      contentField: undefined,
      data: format
    };
  }
  let contentField;
  if (format.contentField) {
    let field = {
      kind: 'object',
      fields: schema
    };
    let path = Array.isArray(format.contentField) ? format.contentField : [format.contentField];
    let contentExtension;
    try {
      contentExtension = getContentExtension(path, field, () => JSON.stringify(format.contentField));
    } catch (err) {
      if (err instanceof ContentFieldLocationError) {
        throw new Error(`${err.message} (${type}.${key})`);
      }
      throw err;
    }
    contentField = {
      path,
      contentExtension
    };
  }
  return {
    data: (_format$data = format.data) !== null && _format$data !== void 0 ? _format$data : 'yaml',
    contentField,
    dataLocation
  };
}
class ContentFieldLocationError extends Error {
  constructor(message) {
    super(message);
  }
}
function getContentExtension(path, schema, debugName) {
  if (path.length === 0) {
    if (schema.kind !== 'form' || schema.formKind !== 'content') {
      throw new ContentFieldLocationError(`Content field for ${debugName()} is not a content field`);
    }
    return schema.contentExtension;
  }
  if (schema.kind === 'object') {
    const field = schema.fields[path[0]];
    if (!field) {
      throw new ContentFieldLocationError(`Field ${debugName()} specified in contentField does not exist`);
    }
    return getContentExtension(path.slice(1), field, debugName);
  }
  if (schema.kind === 'conditional') {
    if (path[0] !== 'value') {
      throw new ContentFieldLocationError(`Conditional fields referenced in a contentField path must only reference the value field (${debugName()})`);
    }
    let contentExtension;
    const innerPath = path.slice(1);
    for (const value of Object.values(schema.values)) {
      const foundContentExtension = getContentExtension(innerPath, value, debugName);
      if (!contentExtension) {
        contentExtension = foundContentExtension;
        continue;
      }
      if (contentExtension !== foundContentExtension) {
        throw new ContentFieldLocationError(`contentField ${debugName()} has conflicting content extensions`);
      }
    }
    if (!contentExtension) {
      throw new ContentFieldLocationError(`contentField ${debugName()} does not point to a content field`);
    }
    return contentExtension;
  }
  throw new ContentFieldLocationError(`Path specified in contentField ${debugName()} does not point to a content field`);
}

function getSrcPrefix(publicPath, slug) {
  return typeof publicPath === 'string' ? `${publicPath.replace(/\/*$/, '')}/${slug === undefined ? '' : slug + '/'}` : '';
}

function deserializeFiles(nodes, componentBlocks, files, otherFiles, mode, documentFeatures, slug) {
  return nodes.map(node => {
    if (node.type === 'component-block') {
      const componentBlock = componentBlocks[node.component];
      if (!componentBlock) return node;
      const schema = object(componentBlock.schema);
      return {
        ...node,
        props: deserializeProps(schema, node.props, files, otherFiles, mode, slug)
      };
    }
    if (node.type === 'image' && typeof node.src === 'string' && mode === 'edit') {
      var _ref;
      const prefix = getSrcPrefixForImageBlock(documentFeatures, slug);
      const filename = node.src.slice(prefix.length);
      const content = (_ref = typeof documentFeatures.images === 'object' && typeof documentFeatures.images.directory === 'string' ? otherFiles.get(fixPath(documentFeatures.images.directory)) : files) === null || _ref === void 0 ? void 0 : _ref.get(filename);
      if (!content) {
        return {
          type: 'paragraph',
          children: [{
            text: `Missing image ${filename}`
          }]
        };
      }
      return {
        type: 'image',
        src: {
          filename,
          content
        },
        alt: node.alt,
        title: node.title,
        children: [{
          text: ''
        }]
      };
    }
    if (typeof node.type === 'string') {
      const children = deserializeFiles(node.children, componentBlocks, files, otherFiles, mode, documentFeatures, slug);
      return {
        ...node,
        children
      };
    }
    return node;
  });
}
function deserializeProps(schema, value, files, otherFiles, mode, slug) {
  return transformProps(schema, value, {
    form: (schema, value) => {
      if (schema.formKind === 'asset') {
        var _otherFiles$get;
        if (mode === 'read') {
          return schema.reader.parse(value);
        }
        const filename = schema.filename(value, {
          slug,
          suggestedFilenamePrefix: undefined
        });
        return schema.parse(value, {
          asset: filename ? schema.directory ? (_otherFiles$get = otherFiles.get(schema.directory)) === null || _otherFiles$get === void 0 ? void 0 : _otherFiles$get.get(filename) : files.get(filename) : undefined,
          slug
        });
      }
      if (schema.formKind === 'content' || schema.formKind === 'assets') {
        throw new Error('Not implemented');
      }
      if (mode === 'read') {
        return schema.reader.parse(value);
      }
      return schema.parse(value, undefined);
    }
  });
}
function getSrcPrefixForImageBlock(documentFeatures, slug) {
  return getSrcPrefix(typeof documentFeatures.images === 'object' ? documentFeatures.images.publicPath : undefined, slug);
}

async function sha1(content) {
  return createHash('sha1').update(content).digest('hex');
}

const textEncoder$1 = new TextEncoder();
const blobShaCache = new WeakMap();
async function blobSha(contents) {
  const cached = blobShaCache.get(contents);
  if (cached !== undefined) return cached;
  const blobPrefix = textEncoder$1.encode('blob ' + contents.length + '\0');
  const array = new Uint8Array(blobPrefix.byteLength + contents.byteLength);
  array.set(blobPrefix, 0);
  array.set(contents, blobPrefix.byteLength);
  const digestPromise = sha1(array);
  blobShaCache.set(contents, digestPromise);
  digestPromise.then(digest => blobShaCache.set(contents, digest));
  return digestPromise;
}
function getNodeAtPath(tree, path) {
  if (path === '') return tree;
  let node = tree;
  for (const part of path.split('/')) {
    if (!node.has(part)) {
      node.set(part, new Map());
    }
    const innerNode = node.get(part);
    assert(innerNode instanceof Map, 'expected tree');
    node = innerNode;
  }
  return node;
}
function getFilename(path) {
  return path.replace(/.*\//, '');
}
function getDirname(path) {
  if (!path.includes('/')) return '';
  return path.replace(/\/[^/]+$/, '');
}
function toTreeChanges(changes) {
  const changesRoot = new Map();
  for (const deletion of changes.deletions) {
    const parentTree = getNodeAtPath(changesRoot, getDirname(deletion));
    parentTree.set(getFilename(deletion), 'delete');
  }
  for (const addition of changes.additions) {
    const parentTree = getNodeAtPath(changesRoot, getDirname(addition.path));
    parentTree.set(getFilename(addition.path), addition.contents);
  }
  return changesRoot;
}
const SPACE_CHAR_CODE = 32;
const space = new Uint8Array([SPACE_CHAR_CODE]);
const nullchar = new Uint8Array([0]);
const tree$1 = textEncoder$1.encode('tree ');

// based on https://github.com/isomorphic-git/isomorphic-git/blob/c09dfa20ffe0ab9e6602e0fa172d72ba8994e443/src/models/GitTree.js#L108-L122
function treeSha(children) {
  const entries = [...children].map(([name, node]) => ({
    name,
    sha: node.entry.sha,
    mode: node.entry.mode
  }));
  entries.sort((a, b) => {
    const aName = a.mode === '040000' ? a.name + '/' : a.name;
    const bName = b.mode === '040000' ? b.name + '/' : b.name;
    return aName === bName ? 0 : aName < bName ? -1 : 1;
  });
  const treeObject = entries.flatMap(entry => {
    const mode = textEncoder$1.encode(entry.mode.replace(/^0/, ''));
    const name = textEncoder$1.encode(entry.name);
    const sha = hexToBytes(entry.sha);
    return [mode, space, name, nullchar, sha];
  });
  return sha1(concatBytes([tree$1, textEncoder$1.encode(treeObject.reduce((sum, val) => sum + val.byteLength, 0).toString()), nullchar, ...treeObject]));
}
function concatBytes(byteArrays) {
  const totalLength = byteArrays.reduce((sum, arr) => sum + arr.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of byteArrays) {
    result.set(arr, offset);
    offset += arr.byteLength;
  }
  return result;
}
function hexToBytes(str) {
  const bytes = new Uint8Array(str.length / 2);
  for (var i = 0; i < bytes.byteLength; i += 1) {
    const start = i * 2;
    bytes[i] = parseInt(str.slice(start, start + 2), 16);
  }
  return bytes;
}
async function createTreeNodeEntry(path, children) {
  const sha = await treeSha(children);
  return {
    path,
    mode: '040000',
    type: 'tree',
    sha
  };
}
async function createBlobNodeEntry(path, contents) {
  const sha = 'sha' in contents ? contents.sha : await blobSha(contents);
  return {
    path,
    mode: '100644',
    type: 'blob',
    sha
  };
}
async function updateTreeWithChanges(tree, changes) {
  var _await$updateTree;
  const newTree = (_await$updateTree = await updateTree(tree, toTreeChanges(changes), [])) !== null && _await$updateTree !== void 0 ? _await$updateTree : new Map();
  return {
    entries: treeToEntries(newTree),
    sha: await treeSha(newTree !== null && newTree !== void 0 ? newTree : new Map())
  };
}
function treeToEntries(tree) {
  return [...tree.values()].flatMap(x => x.children ? [x.entry, ...treeToEntries(x.children)] : [x.entry]);
}
async function updateTree(tree, changedTree, path) {
  const newTree = new Map(tree);
  for (const [key, value] of changedTree) {
    if (value === 'delete') {
      newTree.delete(key);
    }
    if (value instanceof Map) {
      var _newTree$get$children, _newTree$get;
      const existingChildren = (_newTree$get$children = (_newTree$get = newTree.get(key)) === null || _newTree$get === void 0 ? void 0 : _newTree$get.children) !== null && _newTree$get$children !== void 0 ? _newTree$get$children : new Map();
      const children = await updateTree(existingChildren, value, path.concat(key));
      if (children === undefined) {
        newTree.delete(key);
        continue;
      }
      const entry = await createTreeNodeEntry(path.concat(key).join('/'), children);
      newTree.set(key, {
        entry,
        children
      });
    }
    if (value instanceof Uint8Array || typeof value === 'object' && 'sha' in value) {
      const entry = await createBlobNodeEntry(path.concat(key).join('/'), value);
      newTree.set(key, {
        entry
      });
    }
  }
  if (newTree.size === 0) {
    return undefined;
  }
  return newTree;
}

function collectDirectoriesUsedInSchemaInner(schema, directories, seenSchemas) {
  if (seenSchemas.has(schema)) {
    return;
  }
  seenSchemas.add(schema);
  if (schema.kind === 'array') {
    return collectDirectoriesUsedInSchemaInner(schema.element, directories, seenSchemas);
  }
  if (schema.kind === 'child') {
    return;
  }
  if (schema.kind === 'form') {
    if (schema.formKind === 'asset' && schema.directory !== undefined) {
      directories.add(fixPath(schema.directory));
    }
    if ((schema.formKind === 'content' || schema.formKind === 'assets') && schema.directories !== undefined) {
      for (const directory of schema.directories) {
        directories.add(fixPath(directory));
      }
    }
    return;
  }
  if (schema.kind === 'object') {
    for (const field of Object.values(schema.fields)) {
      collectDirectoriesUsedInSchemaInner(field, directories, seenSchemas);
    }
    return;
  }
  if (schema.kind === 'conditional') {
    for (const innerSchema of Object.values(schema.values)) {
      collectDirectoriesUsedInSchemaInner(innerSchema, directories, seenSchemas);
    }
    return;
  }
  assertNever(schema);
}
function collectDirectoriesUsedInSchema(schema) {
  const directories = new Set();
  collectDirectoriesUsedInSchemaInner(schema, directories, new Set());
  return directories;
}
function getDirectoriesForTreeKey(schema, directory, slug, format) {
  const directories = [fixPath(directory)];
  if (format.dataLocation === 'outer') {
    directories.push(fixPath(directory) + getDataFileExtension(format));
  }
  const toAdd = '' ;
  for (const directory of collectDirectoriesUsedInSchema(schema)) {
    directories.push(directory + toAdd);
  }
  return directories;
}

const textDecoder$1 = new TextDecoder();
const defaultAltField$1 = text({
  label: 'Alt text',
  description: 'This text will be used by screen readers and search engines.'
});
const emptyTitleField$1 = basicFormFieldWithSimpleReaderParse({
  Input() {
    return null;
  },
  defaultValue() {
    return '';
  },
  parse(value) {
    if (value === undefined) return '';
    if (typeof value !== 'string') {
      throw new FieldDataError('Must be string');
    }
    return value;
  },
  validate(value) {
    return value;
  },
  serialize(value) {
    return {
      value
    };
  },
  label: 'Title'
});
function normaliseDocumentFeatures(config) {
  var _config$formatting, _formatting$alignment, _formatting$alignment2, _formatting$blockType, _formatting$inlineMar, _formatting$inlineMar2, _formatting$inlineMar3, _formatting$inlineMar4, _formatting$inlineMar5, _formatting$inlineMar6, _formatting$inlineMar7, _formatting$inlineMar8, _formatting$listTypes, _formatting$listTypes2, _imagesConfig$schema$, _imagesConfig$schema, _imagesConfig$schema$2, _imagesConfig$schema2;
  const formatting = config.formatting === true ? {
    // alignment: true, // not supported natively in markdown
    blockTypes: true,
    headingLevels: true,
    inlineMarks: true,
    listTypes: true,
    softBreaks: true
  } : (_config$formatting = config.formatting) !== null && _config$formatting !== void 0 ? _config$formatting : {};
  const imagesConfig = config.images === true ? {} : config.images;
  return {
    formatting: {
      alignment: formatting.alignment === true ? {
        center: true,
        end: true
      } : {
        center: !!((_formatting$alignment = formatting.alignment) !== null && _formatting$alignment !== void 0 && _formatting$alignment.center),
        end: !!((_formatting$alignment2 = formatting.alignment) !== null && _formatting$alignment2 !== void 0 && _formatting$alignment2.end)
      },
      blockTypes: (formatting === null || formatting === void 0 ? void 0 : formatting.blockTypes) === true ? {
        blockquote: true,
        code: {
          schema: object({})
        }
      } : {
        blockquote: !!((_formatting$blockType = formatting.blockTypes) !== null && _formatting$blockType !== void 0 && _formatting$blockType.blockquote),
        code: (_formatting$blockType2 => {
          if (((_formatting$blockType2 = formatting.blockTypes) === null || _formatting$blockType2 === void 0 ? void 0 : _formatting$blockType2.code) === undefined) {
            return false;
          }
          if (formatting.blockTypes.code === true || !formatting.blockTypes.code.schema) {
            return {
              schema: object({})
            };
          }
          for (const key of ['type', 'children', 'language']) {
            if (key in formatting.blockTypes.code.schema) {
              throw new Error(`"${key}" cannot be a key in the schema for code blocks`);
            }
          }
          return {
            schema: object(formatting.blockTypes.code.schema)
          };
        })()
      },
      headings: (_obj$schema => {
        const opt = formatting === null || formatting === void 0 ? void 0 : formatting.headingLevels;
        const obj = typeof opt === 'object' && 'levels' in opt ? opt : {
          levels: opt,
          schema: undefined
        };
        if (obj.schema) {
          for (const key of ['type', 'children', 'level', 'textAlign']) {
            if (key in obj.schema) {
              throw new Error(`"${key}" cannot be a key in the schema for headings`);
            }
          }
        }
        return {
          levels: [...new Set(obj.levels === true ? [1, 2, 3, 4, 5, 6] : obj.levels)],
          schema: object((_obj$schema = obj.schema) !== null && _obj$schema !== void 0 ? _obj$schema : {})
        };
      })(),
      inlineMarks: formatting.inlineMarks === true ? {
        bold: true,
        code: true,
        italic: true,
        keyboard: false,
        // not supported natively in markdown
        strikethrough: true,
        subscript: false,
        // not supported natively in markdown
        superscript: false,
        // not supported natively in markdown
        underline: false // not supported natively in markdown
      } : {
        bold: !!((_formatting$inlineMar = formatting.inlineMarks) !== null && _formatting$inlineMar !== void 0 && _formatting$inlineMar.bold),
        code: !!((_formatting$inlineMar2 = formatting.inlineMarks) !== null && _formatting$inlineMar2 !== void 0 && _formatting$inlineMar2.code),
        italic: !!((_formatting$inlineMar3 = formatting.inlineMarks) !== null && _formatting$inlineMar3 !== void 0 && _formatting$inlineMar3.italic),
        strikethrough: !!((_formatting$inlineMar4 = formatting.inlineMarks) !== null && _formatting$inlineMar4 !== void 0 && _formatting$inlineMar4.strikethrough),
        underline: !!((_formatting$inlineMar5 = formatting.inlineMarks) !== null && _formatting$inlineMar5 !== void 0 && _formatting$inlineMar5.underline),
        keyboard: !!((_formatting$inlineMar6 = formatting.inlineMarks) !== null && _formatting$inlineMar6 !== void 0 && _formatting$inlineMar6.keyboard),
        subscript: !!((_formatting$inlineMar7 = formatting.inlineMarks) !== null && _formatting$inlineMar7 !== void 0 && _formatting$inlineMar7.subscript),
        superscript: !!((_formatting$inlineMar8 = formatting.inlineMarks) !== null && _formatting$inlineMar8 !== void 0 && _formatting$inlineMar8.superscript)
      },
      listTypes: formatting.listTypes === true ? {
        ordered: true,
        unordered: true
      } : {
        ordered: !!((_formatting$listTypes = formatting.listTypes) !== null && _formatting$listTypes !== void 0 && _formatting$listTypes.ordered),
        unordered: !!((_formatting$listTypes2 = formatting.listTypes) !== null && _formatting$listTypes2 !== void 0 && _formatting$listTypes2.unordered)
      },
      softBreaks: !!formatting.softBreaks
    },
    links: !!config.links,
    layouts: [...new Set((config.layouts || []).map(x => JSON.stringify(x)))].map(x => JSON.parse(x)),
    dividers: !!config.dividers,
    images: imagesConfig === undefined ? false : {
      ...imagesConfig,
      schema: {
        alt: (_imagesConfig$schema$ = (_imagesConfig$schema = imagesConfig.schema) === null || _imagesConfig$schema === void 0 ? void 0 : _imagesConfig$schema.alt) !== null && _imagesConfig$schema$ !== void 0 ? _imagesConfig$schema$ : defaultAltField$1,
        title: (_imagesConfig$schema$2 = (_imagesConfig$schema2 = imagesConfig.schema) === null || _imagesConfig$schema2 === void 0 ? void 0 : _imagesConfig$schema2.title) !== null && _imagesConfig$schema$2 !== void 0 ? _imagesConfig$schema$2 : emptyTitleField$1
      }
    },
    tables: !!config.tables
  };
}

/**
 * @deprecated `fields.markdoc` has superseded this field. `fields.mdx` is also available if you prefer MDX.
 */
function document({
  label,
  componentBlocks = {},
  description,
  ...documentFeaturesConfig
}) {
  const documentFeatures = normaliseDocumentFeatures(documentFeaturesConfig);
  return {
    kind: 'form',
    formKind: 'content',
    defaultValue() {
      return [{
        type: 'paragraph',
        children: [{
          text: ''
        }]
      }];
    },
    Input(props) {
      return /*#__PURE__*/jsx(DocumentFieldInput, {
        componentBlocks: componentBlocks,
        description: description,
        label: label,
        documentFeatures: documentFeatures,
        ...props
      });
    },
    parse(_, data) {
      const markdoc = textDecoder$1.decode(data.content);
      fromMarkdoc(parse(markdoc), componentBlocks);
      return deserializeFiles(normalizeDocumentFieldChildren(), componentBlocks, data.other, data.external, 'edit', documentFeatures, data.slug);
    },
    contentExtension: '.mdoc',
    validate(value) {
      return value;
    },
    directories: [...collectDirectoriesUsedInSchema(object(Object.fromEntries(Object.entries(componentBlocks).map(([name, block]) => [name, object(block.schema)])))), ...(typeof documentFeatures.images === 'object' && typeof documentFeatures.images.directory === 'string' ? [fixPath(documentFeatures.images.directory)] : [])],
    serialize(value, opts) {
      return serializeMarkdoc();
    },
    reader: {
      parse(value, data) {
        const markdoc = textDecoder$1.decode(data.content);
        const document = fromMarkdoc(parse(markdoc), componentBlocks);
        return deserializeFiles(document, componentBlocks, new Map(), new Map(), 'read', documentFeatures, undefined);
      }
    }
  };
}

const defaultAltField = text({
  label: 'Alt text',
  description: 'This text will be used by screen readers and search engines.'
});
const emptyTitleField = basicFormFieldWithSimpleReaderParse({
  Input() {
    return null;
  },
  defaultValue() {
    return '';
  },
  parse(value) {
    if (value === undefined) return '';
    if (typeof value !== 'string') {
      throw new FieldDataError('Must be string');
    }
    return value;
  },
  validate(value) {
    return value;
  },
  serialize(value) {
    return {
      value
    };
  },
  label: 'Title'
});
function editorOptionsToConfig(options) {
  var _options$bold, _options$italic, _options$strikethroug, _options$code, _options$blockquote, _options$orderedList, _options$unorderedLis, _options$table, _options$link, _options$divider;
  return {
    bold: (_options$bold = options.bold) !== null && _options$bold !== void 0 ? _options$bold : true,
    italic: (_options$italic = options.italic) !== null && _options$italic !== void 0 ? _options$italic : true,
    strikethrough: (_options$strikethroug = options.strikethrough) !== null && _options$strikethroug !== void 0 ? _options$strikethroug : true,
    code: (_options$code = options.code) !== null && _options$code !== void 0 ? _options$code : true,
    heading: (() => {
      let levels = [];
      let levelsOpt = typeof options.heading === 'object' && !Array.isArray(options.heading) ? options.heading.levels : options.heading;
      if (levelsOpt === true || levelsOpt === undefined) {
        levels = [1, 2, 3, 4, 5, 6];
      }
      if (Array.isArray(levelsOpt)) {
        levels = levelsOpt;
      }
      return {
        levels,
        schema: options.heading && typeof options.heading === 'object' && 'schema' in options.heading ? options.heading.schema : {}
      };
    })(),
    blockquote: (_options$blockquote = options.blockquote) !== null && _options$blockquote !== void 0 ? _options$blockquote : true,
    orderedList: (_options$orderedList = options.orderedList) !== null && _options$orderedList !== void 0 ? _options$orderedList : true,
    unorderedList: (_options$unorderedLis = options.unorderedList) !== null && _options$unorderedLis !== void 0 ? _options$unorderedLis : true,
    table: (_options$table = options.table) !== null && _options$table !== void 0 ? _options$table : true,
    link: (_options$link = options.link) !== null && _options$link !== void 0 ? _options$link : true,
    image: options.image !== false ? ((_opts$transformFilena, _opts$schema$alt, _opts$schema, _opts$schema$title, _opts$schema2) => {
      const opts = options.image === true ? undefined : options.image;
      return {
        directory: opts === null || opts === void 0 ? void 0 : opts.directory,
        publicPath: opts === null || opts === void 0 ? void 0 : opts.publicPath,
        transformFilename: (_opts$transformFilena = opts === null || opts === void 0 ? void 0 : opts.transformFilename) !== null && _opts$transformFilena !== void 0 ? _opts$transformFilena : x => x,
        schema: {
          alt: (_opts$schema$alt = opts === null || opts === void 0 || (_opts$schema = opts.schema) === null || _opts$schema === void 0 ? void 0 : _opts$schema.alt) !== null && _opts$schema$alt !== void 0 ? _opts$schema$alt : defaultAltField,
          title: (_opts$schema$title = opts === null || opts === void 0 || (_opts$schema2 = opts.schema) === null || _opts$schema2 === void 0 ? void 0 : _opts$schema2.title) !== null && _opts$schema$title !== void 0 ? _opts$schema$title : emptyTitleField
        }
      };
    })() : undefined,
    divider: (_options$divider = options.divider) !== null && _options$divider !== void 0 ? _options$divider : true,
    codeBlock: options.codeBlock === false ? undefined : {
      schema: typeof options.codeBlock === 'object' ? options.codeBlock.schema : {}
    }
  };
}

function getTypeForField(field) {
  if (field.kind === 'object' || field.kind === 'conditional') {
    return {
      type: Object,
      required: true
    };
  }
  if (field.kind === 'array') {
    return {
      type: Array,
      required: true
    };
  }
  if (field.kind === 'child') {
    return {};
  }
  if (field.formKind === undefined) {
    if (typeof field.defaultValue === 'string' && 'options' in field && Array.isArray(field.options) && field.options.every(val => typeof val === 'object' && val !== null && 'value' in val && typeof val.value === 'string')) {
      return {
        type: String,
        matches: field.options.map(x => x.value),
        required: true
      };
    }
    if (typeof field.defaultValue === 'string') {
      let required = false;
      try {
        field.parse('');
      } catch {
        required = true;
      }
      return {
        type: String,
        required
      };
    }
    try {
      field.parse(1);
      return {
        type: Number
      };
    } catch {}
    if (typeof field.defaultValue === 'boolean') {
      return {
        type: Boolean,
        required: true
      };
    }
    return {};
  }
  if (field.formKind === 'slug') {
    let required = false;
    try {
      field.parse('', undefined);
    } catch {
      required = true;
    }
    return {
      type: String,
      required
    };
  }
  if (field.formKind === 'asset') {
    let required = false;
    try {
      field.validate(null);
    } catch {
      required = true;
    }
    return {
      type: String,
      required
    };
  }
  return {};
}
function fieldsToMarkdocAttributes(fields) {
  return Object.fromEntries(Object.entries(fields).map(([name, field]) => {
    const schema = getTypeForField(field);
    return [name, schema];
  }));
}
function createMarkdocConfig(opts) {
  const editorConfig = editorOptionsToConfig(opts.options || {});
  const config = {
    nodes: {
      ...nodes
    },
    tags: {}
  };
  if (editorConfig.heading.levels.length) {
    config.nodes.heading = {
      ...nodes.heading,
      attributes: {
        ...nodes.heading.attributes,
        ...fieldsToMarkdocAttributes(editorConfig.heading.schema)
      }
    };
  } else {
    config.nodes.heading = undefined;
  }
  if (!editorConfig.blockquote) {
    config.nodes.blockquote = undefined;
  }
  if (editorConfig.codeBlock) {
    config.nodes.fence = {
      ...nodes.fence,
      attributes: {
        ...nodes.fence.attributes,
        ...fieldsToMarkdocAttributes(editorConfig.codeBlock.schema)
      }
    };
  } else {
    config.nodes.fence = undefined;
  }
  if (!editorConfig.orderedList && !editorConfig.unorderedList) {
    config.nodes.list = undefined;
  }
  if (!editorConfig.bold) {
    config.nodes.strong = undefined;
  }
  if (!editorConfig.italic) {
    config.nodes.em = undefined;
  }
  if (!editorConfig.strikethrough) {
    config.nodes.s = undefined;
  }
  if (!editorConfig.link) {
    config.nodes.link = undefined;
  }
  if (!editorConfig.image) {
    config.nodes.image = undefined;
  }
  if (!editorConfig.divider) {
    config.nodes.hr = undefined;
  }
  if (!editorConfig.table) {
    config.nodes.table = undefined;
  }
  for (const [name, component] of Object.entries(opts.components || {})) {
    var _opts$render;
    const isEmpty = component.kind === 'block' || component.kind === 'inline';
    config.tags[name] = {
      render: (_opts$render = opts.render) === null || _opts$render === void 0 || (_opts$render = _opts$render.tags) === null || _opts$render === void 0 ? void 0 : _opts$render[name],
      children: isEmpty ? [] : undefined,
      selfClosing: isEmpty,
      attributes: fieldsToMarkdocAttributes(component.schema),
      description: 'description' in component ? component.description : undefined,
      inline: component.kind === 'inline' || component.kind === 'mark'
    };
  }
  for (const [name, render] of Object.entries(((_opts$render2 = opts.render) === null || _opts$render2 === void 0 ? void 0 : _opts$render2.nodes) || {})) {
    var _opts$render2;
    const nodeSchema = config.nodes[name];
    if (nodeSchema) {
      nodeSchema.render = render;
    }
  }
  return config;
}

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();
function getDirectoriesForEditorField(components, config) {
  return [...collectDirectoriesUsedInSchema(object(Object.fromEntries(Object.entries(components).map(([name, component]) => [name, object(component.schema)])))), ...(typeof config.image === 'object' && typeof config.image.directory === 'string' ? [fixPath(config.image.directory)] : [])];
}
function markdoc({
  label,
  description,
  options = {},
  components = {},
  extension = 'mdoc'
}) {
  let schema;
  const config = editorOptionsToConfig(options);
  let getSchema = () => {
    if (!schema) {
      schema = createEditorSchema();
    }
    return schema;
  };
  return {
    kind: 'form',
    formKind: 'content',
    defaultValue() {
      return getDefaultValue(getSchema());
    },
    Input(props) {
      return /*#__PURE__*/jsx(DocumentFieldInput, {
        description: description,
        label: label,
        ...props
      });
    },
    parse: (_, {
      content,
      other,
      external,
      slug
    }) => {
      const text = textDecoder.decode(content);
      return parseToEditorState(text, getSchema());
    },
    contentExtension: `.${extension}`,
    validate(value) {
      return value;
    },
    directories: getDirectoriesForEditorField(components, config),
    serialize(value, {
      slug
    }) {
      const out = serializeFromEditorState();
      return {
        content: textEncoder.encode(out.content),
        external: out.external,
        other: out.other,
        value: undefined
      };
    },
    reader: {
      parse: (_, {
        content
      }) => {
        const text = textDecoder.decode(content);
        return {
          node: parse(text)
        };
      }
    },
    collaboration: {
      toYjs(value) {
        return prosemirrorToYXmlFragment(value.doc);
      },
      fromYjs(yjsValue, awareness) {
        return createEditorStateFromYJS(getSchema());
      }
    }
  };
}
markdoc.createMarkdocConfig = createMarkdocConfig;
markdoc.inline = function inlineMarkdoc({
  label,
  description,
  options = {},
  components = {}
}) {
  let schema;
  const config = editorOptionsToConfig(options);
  let getSchema = () => {
    if (!schema) {
      schema = createEditorSchema();
    }
    return schema;
  };
  return {
    kind: 'form',
    formKind: 'assets',
    defaultValue() {
      return getDefaultValue(getSchema());
    },
    Input(props) {
      return /*#__PURE__*/jsx(DocumentFieldInput, {
        description: description,
        label: label,
        ...props
      });
    },
    parse: (value, {
      other,
      external,
      slug
    }) => {
      if (value === undefined) {
        value = '';
      }
      if (typeof value !== 'string') {
        throw new FieldDataError('Must be a string');
      }
      return parseToEditorState(value, getSchema());
    },
    validate(value) {
      return value;
    },
    directories: getDirectoriesForEditorField(components, config),
    serialize(value, {
      slug
    }) {
      const out = serializeFromEditorState();
      return {
        external: out.external,
        other: out.other,
        value: out.content
      };
    },
    reader: {
      parse: value => {
        if (value === undefined) {
          value = '';
        }
        if (typeof value !== 'string') {
          throw new FieldDataError('Must be a string');
        }
        return {
          node: parse(value)
        };
      }
    },
    collaboration: {
      toYjs(value) {
        return prosemirrorToYXmlFragment(value.doc);
      },
      fromYjs(yjsValue, awareness) {
        return createEditorStateFromYJS(getSchema());
      }
    }
  };
};
function mdx({
  label,
  description,
  options = {},
  components = {},
  extension = 'mdx'
}) {
  let schema;
  const config = editorOptionsToConfig(options);
  let getSchema = () => {
    if (!schema) {
      schema = createEditorSchema();
    }
    return schema;
  };
  return {
    kind: 'form',
    formKind: 'content',
    defaultValue() {
      return getDefaultValue(getSchema());
    },
    Input(props) {
      return /*#__PURE__*/jsx(DocumentFieldInput, {
        description: description,
        label: label,
        ...props
      });
    },
    parse: (_, {
      content,
      other,
      external,
      slug
    }) => {
      const text = textDecoder.decode(content);
      return parseToEditorStateMDX(text, getSchema());
    },
    contentExtension: `.${extension}`,
    validate(value) {
      return value;
    },
    directories: getDirectoriesForEditorField(components, config),
    serialize(value, {
      slug
    }) {
      const out = serializeFromEditorStateMDX();
      return {
        content: textEncoder.encode(out.content),
        external: out.external,
        other: out.other,
        value: undefined
      };
    },
    reader: {
      parse: (_, {
        content
      }) => {
        const text = textDecoder.decode(content);
        return text;
      }
    },
    collaboration: {
      toYjs(value) {
        return prosemirrorToYXmlFragment(value.doc);
      },
      fromYjs(yjsValue, awareness) {
        return createEditorStateFromYJS(getSchema());
      }
    }
  };
}
mdx.inline = function mdx({
  label,
  description,
  options = {},
  components = {}
}) {
  let schema;
  const config = editorOptionsToConfig(options);
  let getSchema = () => {
    if (!schema) {
      schema = createEditorSchema();
    }
    return schema;
  };
  return {
    kind: 'form',
    formKind: 'assets',
    defaultValue() {
      return getDefaultValue(getSchema());
    },
    Input(props) {
      return /*#__PURE__*/jsx(DocumentFieldInput, {
        description: description,
        label: label,
        ...props
      });
    },
    parse: (value, {
      other,
      external,
      slug
    }) => {
      if (value === undefined) {
        value = '';
      }
      if (typeof value !== 'string') {
        throw new FieldDataError('Must be a string');
      }
      return parseToEditorStateMDX(value, getSchema());
    },
    validate(value) {
      return value;
    },
    directories: getDirectoriesForEditorField(components, config),
    serialize(value, {
      slug
    }) {
      const out = serializeFromEditorStateMDX();
      return {
        external: out.external,
        other: out.other,
        value: out.content
      };
    },
    reader: {
      parse: value => {
        if (value === undefined) {
          value = '';
        }
        if (typeof value !== 'string') {
          throw new FieldDataError('Must be a string');
        }
        return value;
      }
    },
    collaboration: {
      toYjs(value) {
        return prosemirrorToYXmlFragment(value.doc);
      },
      fromYjs(yjsValue, awareness) {
        return createEditorStateFromYJS(getSchema());
      }
    }
  };
};

async function readDirEntries(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, {
      withFileTypes: true
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
  return entries;
}
async function collectEntriesInDir(baseDir, ancestors) {
  const currentRelativeDir = ancestors.map(p => p.segment).join('/');
  const entries = await readDirEntries(path.join(baseDir, currentRelativeDir));
  const gitignore = entries.find(entry => entry.isFile() && entry.name === '.gitignore');
  const gitignoreFilterForDescendents = gitignore ? ignore().add(await fs.readFile(path.join(baseDir, currentRelativeDir, gitignore.name), 'utf8')).createFilter() : () => true;
  const pathSegments = ancestors.map(x => x.segment);
  return (await Promise.all(entries.filter(entry => {
    if (!entry.isDirectory() && !entry.isFile() || entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.next') {
      return false;
    }
    const innerPath = `${pathSegments.concat(entry.name).join('/')}${entry.isDirectory() ? '/' : ''}`;
    if (!gitignoreFilterForDescendents(innerPath)) {
      return false;
    }
    let currentPath = entry.name;
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const ancestor = ancestors[i];
      currentPath = `${ancestor.segment}/${currentPath}`;
      if (!ancestor.gitignoreFilterForDescendents(currentPath)) {
        return false;
      }
    }
    return true;
  }).map(async entry => {
    if (entry.isDirectory()) {
      return collectEntriesInDir(baseDir, [...ancestors, {
        gitignoreFilterForDescendents,
        segment: entry.name
      }]);
    } else {
      const innerPath = pathSegments.concat(entry.name).join('/');
      const contents = await fs.readFile(path.join(baseDir, innerPath));
      return {
        path: innerPath,
        contents: {
          byteLength: contents.byteLength,
          sha: await blobSha(contents)
        }
      };
    }
  }))).flat();
}
async function readToDirEntries(baseDir) {
  const additions = await collectEntriesInDir(baseDir, []);
  const {
    entries
  } = await updateTreeWithChanges(new Map(), {
    additions: additions,
    deletions: []
  });
  return entries;
}
function getAllowedDirectories(config) {
  const allowedDirectories = [];
  for (const [collection, collectionConfig] of Object.entries((_config$collections = config.collections) !== null && _config$collections !== void 0 ? _config$collections : {})) {
    var _config$collections;
    allowedDirectories.push(...getDirectoriesForTreeKey(object(collectionConfig.schema), getCollectionPath(config, collection), undefined, {
      data: 'yaml',
      contentField: undefined,
      dataLocation: 'index'
    }));
    if (collectionConfig.template) {
      allowedDirectories.push(collectionConfig.template);
    }
  }
  for (const [singleton, singletonConfig] of Object.entries((_config$singletons = config.singletons) !== null && _config$singletons !== void 0 ? _config$singletons : {})) {
    var _config$singletons;
    allowedDirectories.push(...getDirectoriesForTreeKey(object(singletonConfig.schema), getSingletonPath(config, singleton), undefined, getSingletonFormat(config, singleton)));
  }
  return [...new Set(allowedDirectories)];
}

function redirect(to, initialHeaders) {
  return {
    body: null,
    status: 307,
    headers: [...(initialHeaders !== null && initialHeaders !== void 0 ? initialHeaders : []), ['Location', to]]
  };
}

function base64UrlDecode(base64) {
  const binString = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binString, m => m.codePointAt(0));
}
function base64UrlEncode(bytes) {
  return base64Encode(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function base64Encode(bytes) {
  const binString = Array.from(bytes, byte => String.fromCodePoint(byte)).join('');
  return btoa(binString);
}

const ghAppSchema = s.type({
  slug: s.string(),
  client_id: s.string(),
  client_secret: s.string()
});
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function handleGitHubAppCreation(req, slugEnvVarName) {
  const searchParams = new URL(req.url, 'https://localhost').searchParams;
  const code = searchParams.get('code');
  if (typeof code !== 'string' || !/^[a-zA-Z0-9]+$/.test(code)) {
    return {
      status: 400,
      body: 'Bad Request'
    };
  }
  const ghAppRes = await fetch(`https://api.github.com/app-manifests/${code}/conversions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    }
  });
  if (!ghAppRes.ok) {
    console.log(ghAppRes);
    return {
      status: 500,
      body: 'An error occurred while creating the GitHub App'
    };
  }
  const ghAppDataRaw = await ghAppRes.json();
  let ghAppDataResult;
  try {
    ghAppDataResult = s.create(ghAppDataRaw, ghAppSchema);
  } catch {
    console.log(ghAppDataRaw);
    return {
      status: 500,
      body: 'An unexpected response was received from GitHub'
    };
  }
  const toAddToEnv = `# Keystatic
KEYSTATIC_GITHUB_CLIENT_ID=${ghAppDataResult.client_id}
KEYSTATIC_GITHUB_CLIENT_SECRET=${ghAppDataResult.client_secret}
KEYSTATIC_SECRET=${randomBytes(40).toString('hex')}
${slugEnvVarName ? `${slugEnvVarName}=${ghAppDataResult.slug} # https://github.com/apps/${ghAppDataResult.slug}\n` : ''}`;
  let prevEnv;
  try {
    prevEnv = await fs$1.readFile('.env', 'utf-8');
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  const newEnv = prevEnv ? `${prevEnv}\n\n${toAddToEnv}` : toAddToEnv;
  await fs$1.writeFile('.env', newEnv);
  await wait(200);
  return redirect('/keystatic/created-github-app?slug=' + ghAppDataResult.slug);
}
function localModeApiHandler(config, localBaseDirectory) {
  const baseDirectory = path$1.resolve(localBaseDirectory !== null && localBaseDirectory !== void 0 ? localBaseDirectory : process.cwd());
  return async (req, params) => {
    const joined = params.join('/');
    if (req.method === 'GET' && joined === 'tree') {
      return tree(req, config, baseDirectory);
    }
    if (req.method === 'GET' && params[0] === 'blob') {
      return blob(req, config, params, baseDirectory);
    }
    if (req.method === 'POST' && joined === 'update') {
      return update(req, config, baseDirectory);
    }
    return {
      status: 404,
      body: 'Not Found'
    };
  };
}
async function tree(req, config, baseDirectory) {
  if (req.headers.get('no-cors') !== '1') {
    return {
      status: 400,
      body: 'Bad Request'
    };
  }
  return {
    status: 200,
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(await readToDirEntries(baseDirectory))
  };
}
function getIsPathValid(config) {
  const allowedDirectories = getAllowedDirectories(config);
  return filepath => !filepath.includes('\\') && filepath.split('/').every(x => x !== '.' && x !== '..') && allowedDirectories.some(x => filepath.startsWith(x));
}
async function blob(req, config, params, baseDirectory) {
  if (req.headers.get('no-cors') !== '1') {
    return {
      status: 400,
      body: 'Bad Request'
    };
  }
  const expectedSha = params[1];
  const filepath = params.slice(2).join('/');
  const isFilepathValid = getIsPathValid(config);
  if (!isFilepathValid(filepath)) {
    return {
      status: 400,
      body: 'Bad Request'
    };
  }
  let contents;
  try {
    contents = await fs$1.readFile(path$1.join(baseDirectory, filepath));
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {
        status: 404,
        body: 'Not Found'
      };
    }
    throw err;
  }
  const sha = await blobSha(contents);
  if (sha !== expectedSha) {
    return {
      status: 404,
      body: 'Not Found'
    };
  }
  return {
    status: 200,
    body: contents
  };
}
const base64Schema = s.coerce(s.instance(Uint8Array), s.string(), val => base64UrlDecode(val));
async function update(req, config, baseDirectory) {
  if (req.headers.get('no-cors') !== '1' || req.headers.get('content-type') !== 'application/json') {
    return {
      status: 400,
      body: 'Bad Request'
    };
  }
  const isFilepathValid = getIsPathValid(config);
  const filepath = s.refine(s.string(), 'filepath', isFilepathValid);
  let updates;
  try {
    updates = s.create(await req.json(), s.object({
      additions: s.array(s.object({
        path: filepath,
        contents: base64Schema
      })),
      deletions: s.array(s.object({
        path: filepath
      }))
    }));
  } catch {
    return {
      status: 400,
      body: 'Bad data'
    };
  }
  for (const addition of updates.additions) {
    await fs$1.mkdir(path$1.dirname(path$1.join(baseDirectory, addition.path)), {
      recursive: true
    });
    await fs$1.writeFile(path$1.join(baseDirectory, addition.path), addition.contents);
  }
  for (const deletion of updates.deletions) {
    await fs$1.rm(path$1.join(baseDirectory, deletion.path), {
      force: true
    });
  }
  return {
    status: 200,
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(await readToDirEntries(baseDirectory))
  };
}

function bytesToHex(bytes) {
  let str = '';
  for (const byte of bytes) {
    str += byte.toString(16).padStart(2, '0');
  }
  return str;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
async function deriveKey(secret, salt) {
  if (secret.length < 32) {
    throw new Error('KEYSTATIC_SECRET must be at least 32 characters long');
  }
  const encoded = encoder.encode(secret);
  const key = await webcrypto.subtle.importKey('raw', encoded, 'HKDF', false, ['deriveKey']);
  return webcrypto.subtle.deriveKey({
    name: 'HKDF',
    salt,
    hash: 'SHA-256',
    info: new Uint8Array(0)
  }, key, {
    name: 'AES-GCM',
    length: 256
  }, false, ['encrypt', 'decrypt']);
}
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
async function encryptValue(value, secret) {
  const salt = webcrypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = webcrypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(secret, salt);
  const encoded = encoder.encode(value);
  const encrypted = await webcrypto.subtle.encrypt({
    name: 'AES-GCM',
    iv
  }, key, encoded);
  const full = new Uint8Array(SALT_LENGTH + IV_LENGTH + encrypted.byteLength);
  full.set(salt);
  full.set(iv, SALT_LENGTH);
  full.set(new Uint8Array(encrypted), SALT_LENGTH + IV_LENGTH);
  return base64UrlEncode(full);
}
async function decryptValue(encrypted, secret) {
  const decoded = base64UrlDecode(encrypted);
  const salt = decoded.slice(0, SALT_LENGTH);
  const key = await deriveKey(secret, salt);
  const iv = decoded.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const value = decoded.slice(SALT_LENGTH + IV_LENGTH);
  const decrypted = await webcrypto.subtle.decrypt({
    name: 'AES-GCM',
    iv
  }, key, value);
  return decoder.decode(decrypted);
}

const keystaticRouteRegex = /^branch\/[^]+(\/collection\/[^/]+(|\/(create|item\/[^/]+))|\/singleton\/[^/]+)?$/;
const keyToEnvVar = {
  clientId: 'KEYSTATIC_GITHUB_CLIENT_ID',
  clientSecret: 'KEYSTATIC_GITHUB_CLIENT_SECRET',
  secret: 'KEYSTATIC_SECRET'
};
function tryOrUndefined$1(fn) {
  try {
    return fn();
  } catch {
    return undefined;
  }
}
function makeGenericAPIRouteHandler(_config, options) {
  var _config$clientId, _config$clientSecret, _config$secret;
  const _config2 = {
    clientId: (_config$clientId = _config.clientId) !== null && _config$clientId !== void 0 ? _config$clientId : tryOrUndefined$1(() => process.env.KEYSTATIC_GITHUB_CLIENT_ID),
    clientSecret: (_config$clientSecret = _config.clientSecret) !== null && _config$clientSecret !== void 0 ? _config$clientSecret : tryOrUndefined$1(() => process.env.KEYSTATIC_GITHUB_CLIENT_SECRET),
    secret: (_config$secret = _config.secret) !== null && _config$secret !== void 0 ? _config$secret : tryOrUndefined$1(() => process.env.KEYSTATIC_SECRET),
    config: _config.config
  };
  const getParams = req => {
    let url;
    try {
      url = new URL(req.url);
    } catch (err) {
      throw new Error(`Found incomplete URL in Keystatic API route URL handler${(options === null || options === void 0 ? void 0 : options.slugEnvName) === 'NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG' ? ". Make sure you're using the latest version of @keystatic/next" : ''}`);
    }
    return url.pathname.replace(/^\/api\/keystatic\/?/, '').split('/').map(x => decodeURIComponent(x)).filter(Boolean);
  };
  if (_config2.config.storage.kind === 'local') {
    const handler = localModeApiHandler(_config2.config, _config.localBaseDirectory);
    return req => {
      const params = getParams(req);
      return handler(req, params);
    };
  }
  if (_config2.config.storage.kind === 'cloud') {
    return async function keystaticAPIRoute() {
      return {
        status: 404,
        body: 'Not Found'
      };
    };
  }
  if (!_config2.clientId || !_config2.clientSecret || !_config2.secret) {
    if (process.env.NODE_ENV !== 'development') {
      const missingKeys = ['clientId', 'clientSecret', 'secret'].filter(x => !_config2[x]);
      throw new Error(`Missing required config in Keystatic API setup when using the 'github' storage mode:\n${missingKeys.map(key => `- ${key} (can be provided via ${keyToEnvVar[key]} env var)`).join('\n')}\n\nIf you've created your GitHub app locally, make sure to copy the environment variables from your local env file to your deployed environment`);
    }
    return async function keystaticAPIRoute(req) {
      const params = getParams(req);
      const joined = params.join('/');
      if (joined === 'github/created-app') {
        return createdGithubApp(req, options === null || options === void 0 ? void 0 : options.slugEnvName);
      }
      if (joined === 'github/login' || joined === 'github/repo-not-found' || joined === 'github/logout') {
        return redirect('/keystatic/setup');
      }
      return {
        status: 404,
        body: 'Not Found'
      };
    };
  }
  const config = {
    clientId: _config2.clientId,
    clientSecret: _config2.clientSecret,
    secret: _config2.secret,
    config: _config2.config
  };
  return async function keystaticAPIRoute(req) {
    const params = getParams(req);
    const joined = params.join('/');
    if (joined === 'github/oauth/callback') {
      return githubOauthCallback(req, config);
    }
    if (joined === 'github/login') {
      return githubLogin(req, config);
    }
    if (joined === 'github/refresh-token') {
      return githubRefreshToken(req, config);
    }
    if (joined === 'github/repo-not-found') {
      return githubRepoNotFound(req, config);
    }
    if (joined === 'github/logout') {
      var _req$headers$get;
      const cookies = cookie.parse((_req$headers$get = req.headers.get('cookie')) !== null && _req$headers$get !== void 0 ? _req$headers$get : '');
      const access_token = cookies['keystatic-gh-access-token'];
      if (access_token) {
        await fetch(`https://api.github.com/applications/${config.clientId}/token`, {
          method: 'DELETE',
          headers: {
            Authorization: `Basic ${btoa(config.clientId + ':' + config.clientSecret)}`
          },
          body: JSON.stringify({
            access_token
          })
        });
      }
      return redirect('/keystatic', [['Set-Cookie', immediatelyExpiringCookie('keystatic-gh-access-token')], ['Set-Cookie', immediatelyExpiringCookie('keystatic-gh-refresh-token')]]);
    }
    if (joined === 'github/created-app') {
      return {
        status: 404,
        body: 'It looks like you just tried to create a GitHub App for Keystatic but there is already a GitHub App configured for Keystatic.\n\nYou may be here because you started creating a GitHub App but then started the process again elsewhere and completed it there. You should likely go back to Keystatic and sign in with GitHub to continue.'
      };
    }
    return {
      status: 404,
      body: 'Not Found'
    };
  };
}
const tokenDataResultType = s.type({
  access_token: s.string(),
  expires_in: s.number(),
  refresh_token: s.string(),
  refresh_token_expires_in: s.number(),
  scope: s.string(),
  token_type: s.literal('bearer')
});
async function githubOauthCallback(req, config) {
  var _req$headers$get2;
  const searchParams = new URL(req.url, 'http://localhost').searchParams;
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  if (typeof errorDescription === 'string') {
    return {
      status: 400,
      body: `An error occurred when trying to authenticate with GitHub:\n${errorDescription}${error === 'redirect_uri_mismatch' ? `\n\nIf you were trying to sign in locally and recently upgraded Keystatic from @keystatic/core@0.0.69 or below, you need to add \`http://127.0.0.1/api/keystatic/github/oauth/callback\` as a callback URL in your GitHub app.` : ''}`
    };
  }
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  if (typeof code !== 'string') {
    return {
      status: 400,
      body: 'Bad Request'
    };
  }
  const cookies = cookie.parse((_req$headers$get2 = req.headers.get('cookie')) !== null && _req$headers$get2 !== void 0 ? _req$headers$get2 : '');
  const fromCookie = state ? cookies['ks-' + state] : undefined;
  const from = typeof fromCookie === 'string' && keystaticRouteRegex.test(fromCookie) ? fromCookie : undefined;
  const url = new URL('https://github.com/login/oauth/access_token');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('client_secret', config.clientSecret);
  url.searchParams.set('code', code);
  const tokenRes = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    }
  });
  if (!tokenRes.ok) {
    return {
      status: 401,
      body: 'Authorization failed'
    };
  }
  const _tokenData = await tokenRes.json();
  let tokenData;
  try {
    tokenData = tokenDataResultType.create(_tokenData);
  } catch {
    return {
      status: 401,
      body: 'Authorization failed'
    };
  }
  const headers = await getTokenCookies(tokenData, config);
  if (state === 'close') {
    return {
      headers: [...headers, ['Content-Type', 'text/html']],
      body: "<script>localStorage.setItem('ks-refetch-installations', 'true');window.close();</script>",
      status: 200
    };
  }
  return redirect(`/keystatic${from ? `/${from}` : ''}`, headers);
}
async function getTokenCookies(tokenData, config) {
  const headers = [['Set-Cookie', cookie.serialize('keystatic-gh-access-token', tokenData.access_token, {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: tokenData.expires_in,
    expires: new Date(Date.now() + tokenData.expires_in * 1000),
    path: '/'
  })], ['Set-Cookie', cookie.serialize('keystatic-gh-refresh-token', await encryptValue(tokenData.refresh_token, config.secret), {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: tokenData.refresh_token_expires_in,
    expires: new Date(Date.now() + tokenData.refresh_token_expires_in * 100),
    path: '/'
  })]];
  return headers;
}
async function getRefreshToken(req, config) {
  const cookies = cookie.parse(req.headers.get('cookie') || '');
  const refreshTokenCookie = cookies['keystatic-gh-refresh-token'];
  if (!refreshTokenCookie) return;
  let refreshToken;
  try {
    refreshToken = await decryptValue(refreshTokenCookie, config.secret);
  } catch {
    return;
  }
  return refreshToken;
}
async function githubRefreshToken(req, config) {
  const headers = await refreshGitHubAuth(req, config);
  if (!headers) {
    return {
      status: 401,
      body: 'Authorization failed'
    };
  }
  return {
    status: 200,
    headers,
    body: ''
  };
}
async function refreshGitHubAuth(req, config) {
  const refreshToken = await getRefreshToken(req, config);
  if (!refreshToken) {
    return;
  }
  const url = new URL('https://github.com/login/oauth/access_token');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('client_secret', config.clientSecret);
  url.searchParams.set('grant_type', 'refresh_token');
  url.searchParams.set('refresh_token', refreshToken);
  const tokenRes = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    }
  });
  if (!tokenRes.ok) {
    return;
  }
  const _tokenData = await tokenRes.json();
  let tokenData;
  try {
    tokenData = tokenDataResultType.create(_tokenData);
  } catch {
    return;
  }
  return getTokenCookies(tokenData, config);
}
async function githubRepoNotFound(req, config) {
  const headers = await refreshGitHubAuth(req, config);
  if (headers) {
    return redirect('/keystatic/repo-not-found', headers);
  }
  return githubLogin(req, config);
}
async function githubLogin(req, config) {
  const reqUrl = new URL(req.url);
  const rawFrom = reqUrl.searchParams.get('from');
  const from = typeof rawFrom === 'string' && keystaticRouteRegex.test(rawFrom) ? rawFrom : '/';
  const state = bytesToHex(webcrypto.getRandomValues(new Uint8Array(10)));
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', `${reqUrl.origin}/api/keystatic/github/oauth/callback`);
  if (from === '/') {
    return redirect(url.toString());
  }
  url.searchParams.set('state', state);
  return redirect(url.toString(), [['Set-Cookie', cookie.serialize('ks-' + state, from, {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    // 1 day
    maxAge: 60 * 60 * 24,
    expires: new Date(Date.now() + 60 * 60 * 24 * 1000),
    path: '/',
    httpOnly: true
  })]]);
}
async function createdGithubApp(req, slugEnvVarName) {
  if (process.env.NODE_ENV !== 'development') {
    return {
      status: 400,
      body: 'App setup only allowed in development'
    };
  }
  return handleGitHubAppCreation(req, slugEnvVarName);
}
function immediatelyExpiringCookie(name) {
  return cookie.serialize(name, '', {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date()
  });
}

function makeHandler(_config) {
  return async function keystaticAPIRoute(context) {
    var _context$locals, _ref, _config$clientId, _ref2, _config$clientSecret, _ref3, _config$secret;
    const envVarsForCf = (_context$locals = context.locals) === null || _context$locals === void 0 || (_context$locals = _context$locals.runtime) === null || _context$locals === void 0 ? void 0 : _context$locals.env;
    const handler = makeGenericAPIRouteHandler({
      ..._config,
      clientId: (_ref = (_config$clientId = _config.clientId) !== null && _config$clientId !== void 0 ? _config$clientId : envVarsForCf === null || envVarsForCf === void 0 ? void 0 : envVarsForCf.KEYSTATIC_GITHUB_CLIENT_ID) !== null && _ref !== void 0 ? _ref : tryOrUndefined(() => {
        return undefined                                          ;
      }),
      clientSecret: (_ref2 = (_config$clientSecret = _config.clientSecret) !== null && _config$clientSecret !== void 0 ? _config$clientSecret : envVarsForCf === null || envVarsForCf === void 0 ? void 0 : envVarsForCf.KEYSTATIC_GITHUB_CLIENT_SECRET) !== null && _ref2 !== void 0 ? _ref2 : tryOrUndefined(() => {
        return undefined                                              ;
      }),
      secret: (_ref3 = (_config$secret = _config.secret) !== null && _config$secret !== void 0 ? _config$secret : envVarsForCf === null || envVarsForCf === void 0 ? void 0 : envVarsForCf.KEYSTATIC_SECRET) !== null && _ref3 !== void 0 ? _ref3 : tryOrUndefined(() => {
        return undefined                                ;
      })
    }, {
      slugEnvName: "PUBLIC_KEYSTATIC_GITHUB_APP_SLUG"
    });
    const {
      body,
      headers,
      status
    } = await handler(context.request);
    let headersInADifferentStructure = /* @__PURE__ */ new Map();
    if (headers) {
      if (Array.isArray(headers)) {
        for (const [key, value] of headers) {
          if (!headersInADifferentStructure.has(key.toLowerCase())) {
            headersInADifferentStructure.set(key.toLowerCase(), []);
          }
          headersInADifferentStructure.get(key.toLowerCase()).push(value);
        }
      } else if (typeof headers.entries === "function") {
        for (const [key, value] of headers.entries()) {
          headersInADifferentStructure.set(key.toLowerCase(), [value]);
        }
        if ("getSetCookie" in headers && typeof headers.getSetCookie === "function") {
          const setCookieHeaders2 = headers.getSetCookie();
          if (setCookieHeaders2 !== null && setCookieHeaders2 !== void 0 && setCookieHeaders2.length) {
            headersInADifferentStructure.set("set-cookie", setCookieHeaders2);
          }
        }
      } else {
        for (const [key, value] of Object.entries(headers)) {
          headersInADifferentStructure.set(key.toLowerCase(), [value]);
        }
      }
    }
    const setCookieHeaders = headersInADifferentStructure.get("set-cookie");
    headersInADifferentStructure.delete("set-cookie");
    if (setCookieHeaders) {
      for (const setCookieValue of setCookieHeaders) {
        var _options$sameSite;
        const {
          name,
          value,
          ...options
        } = parseString(setCookieValue);
        const sameSite = (_options$sameSite = options.sameSite) === null || _options$sameSite === void 0 ? void 0 : _options$sameSite.toLowerCase();
        context.cookies.set(name, value, {
          domain: options.domain,
          expires: options.expires,
          httpOnly: options.httpOnly,
          maxAge: options.maxAge,
          path: options.path,
          sameSite: sameSite === "lax" || sameSite === "strict" || sameSite === "none" ? sameSite : void 0
        });
      }
    }
    return new Response(body, {
      status,
      headers: [...headersInADifferentStructure.entries()].flatMap(([key, val]) => val.map((x) => [key, x]))
    });
  };
}
function tryOrUndefined(fn) {
  try {
    return fn();
  } catch {
    return void 0;
  }
}

function validateInteger(validation, value, label) {
  if (value !== null && (typeof value !== 'number' || !Number.isInteger(value))) {
    return `${label} must be a whole number`;
  }
  if (validation !== null && validation !== void 0 && validation.isRequired && value === null) {
    return `${label} is required`;
  }
  if (value !== null) {
    if ((validation === null || validation === void 0 ? void 0 : validation.min) !== undefined && value < validation.min) {
      return `${label} must be at least ${validation.min}`;
    }
    if ((validation === null || validation === void 0 ? void 0 : validation.max) !== undefined && value > validation.max) {
      return `${label} must be at most ${validation.max}`;
    }
  }
}

function integer({
  label,
  defaultValue,
  validation,
  description
}) {
  return basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return /*#__PURE__*/jsx(IntegerFieldInput, {
        label: label,
        description: description,
        validation: validation,
        ...props
      });
    },
    defaultValue() {
      return defaultValue !== null && defaultValue !== void 0 ? defaultValue : null;
    },
    parse(value) {
      if (value === undefined) {
        return null;
      }
      if (typeof value === 'number') {
        return value;
      }
      throw new FieldDataError('Must be a number');
    },
    validate(value) {
      const message = validateInteger(validation, value, label);
      if (message !== undefined) {
        throw new FieldDataError(message);
      }
      assertRequired(value, validation, label);
      return value;
    },
    serialize(value) {
      return {
        value: value === null ? undefined : value
      };
    }
  });
}

// Common

// Storage
// ----------------------------------------------------------------------------

// ============================================================================
// Functions
// ============================================================================

function config$1(config) {
  return config;
}
function collection(collection) {
  return collection;
}
function singleton(collection) {
  return collection;
}

function array(element, opts) {
  var _opts$label;
  return {
    kind: 'array',
    element,
    label: (_opts$label = opts === null || opts === void 0 ? void 0 : opts.label) !== null && _opts$label !== void 0 ? _opts$label : 'Items',
    description: opts === null || opts === void 0 ? void 0 : opts.description,
    itemLabel: opts === null || opts === void 0 ? void 0 : opts.itemLabel,
    asChildTag: opts === null || opts === void 0 ? void 0 : opts.asChildTag,
    slugField: opts === null || opts === void 0 ? void 0 : opts.slugField,
    validation: opts === null || opts === void 0 ? void 0 : opts.validation
  };
}

function select({
  label,
  options,
  defaultValue,
  description
}) {
  const optionValuesSet = new Set(options.map(x => x.value));
  if (!optionValuesSet.has(defaultValue)) {
    throw new Error(`A defaultValue of ${defaultValue} was provided to a select field but it does not match the value of one of the options provided`);
  }
  const field = basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return /*#__PURE__*/jsx(SelectFieldInput, {
        label: label,
        options: options,
        description: description,
        ...props
      });
    },
    defaultValue() {
      return defaultValue;
    },
    parse(value) {
      if (value === undefined) {
        return defaultValue;
      }
      if (typeof value !== 'string') {
        throw new FieldDataError('Must be a string');
      }
      if (!optionValuesSet.has(value)) {
        throw new FieldDataError('Must be a valid option');
      }
      return value;
    },
    validate(value) {
      return value;
    },
    serialize(value) {
      return {
        value
      };
    }
  });
  return {
    ...field,
    options
  };
}

function blocks(blocks, opts) {
  const entries = Object.entries(blocks);
  if (!entries.length) {
    throw new Error('fields.blocks must have at least one entry');
  }
  const select$1 = select({
    label: 'Kind',
    defaultValue: entries[0][0],
    options: Object.entries(blocks).map(([key, {
      label
    }]) => ({
      label,
      value: key
    }))
  });
  const element = conditional(select$1, Object.fromEntries(entries.map(([key, {
    schema
  }]) => [key, schema])));
  return {
    ...array(element, {
      label: opts.label,
      description: opts.description,
      validation: opts.validation,
      itemLabel(props) {
        const kind = props.discriminant;
        const block = blocks[kind];
        if (!block.itemLabel) return block.label;
        return block.itemLabel(props.value);
      }
    }),
    Input: BlocksFieldInput
  };
}

function checkbox({
  label,
  defaultValue = false,
  description
}) {
  return basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return /*#__PURE__*/jsx(CheckboxFieldInput, {
        ...props,
        label: label,
        description: description
      });
    },
    defaultValue() {
      return defaultValue;
    },
    parse(value) {
      if (value === undefined) return defaultValue;
      if (typeof value !== 'boolean') {
        throw new FieldDataError('Must be a boolean');
      }
      return value;
    },
    validate(value) {
      return value;
    },
    serialize(value) {
      return {
        value
      };
    }
  });
}

function child(options) {
  return {
    kind: 'child',
    options: options.kind === 'block' ? {
      ...options,
      dividers: options.dividers,
      formatting: options.formatting === 'inherit' ? {
        blockTypes: 'inherit',
        headingLevels: 'inherit',
        inlineMarks: 'inherit',
        listTypes: 'inherit',
        alignment: 'inherit',
        softBreaks: 'inherit'
      } : options.formatting,
      links: options.links,
      images: options.images,
      tables: options.tables,
      componentBlocks: options.componentBlocks
    } : {
      kind: 'inline',
      placeholder: options.placeholder,
      formatting: options.formatting === 'inherit' ? {
        inlineMarks: 'inherit',
        softBreaks: 'inherit'
      } : options.formatting,
      links: options.links
    }
  };
}

function cloudImage({
  label,
  description,
  validation
}) {
  return {
    ...object({
      src: text({
        label: 'URL',
        validation: {
          length: {
            min: validation !== null && validation !== void 0 && validation.isRequired ? 1 : 0
          }
        }
      }),
      alt: text({
        label: 'Alt text'
      }),
      height: integer({
        label: 'Height'
      }),
      width: integer({
        label: 'Width'
      })
    }, {
      label,
      description
    }),
    Input(props) {
      return /*#__PURE__*/jsx(CloudImageFieldInput, {
        ...props,
        isRequired: validation === null || validation === void 0 ? void 0 : validation.isRequired
      });
    }
  };
}

function conditional(discriminant, values) {
  return {
    kind: 'conditional',
    discriminant,
    values: values
  };
}

function validateDate(validation, value, label) {
  if (value !== null && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${label} is not a valid date`;
  }
  if (validation !== null && validation !== void 0 && validation.isRequired && value === null) {
    return `${label} is required`;
  }
  if ((validation !== null && validation !== void 0 && validation.min || validation !== null && validation !== void 0 && validation.max) && value !== null) {
    const date = new Date(value);
    if ((validation === null || validation === void 0 ? void 0 : validation.min) !== undefined) {
      const min = new Date(validation.min);
      if (date < min) {
        return `${label} must be after ${min.toLocaleDateString()}`;
      }
    }
    if ((validation === null || validation === void 0 ? void 0 : validation.max) !== undefined) {
      const max = new Date(validation.max);
      if (date > max) {
        return `${label} must be no later than ${max.toLocaleDateString()}`;
      }
    }
  }
}

function date({
  label,
  defaultValue,
  validation,
  description
}) {
  return basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return /*#__PURE__*/jsx(DateFieldInput, {
        validation: validation,
        label: label,
        description: description,
        ...props
      });
    },
    defaultValue() {
      if (defaultValue === undefined) {
        return null;
      }
      if (typeof defaultValue === 'string') {
        return defaultValue;
      }
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    parse(value) {
      if (value === undefined) {
        return null;
      }
      if (value instanceof Date) {
        const year = value.getUTCFullYear();
        const month = String(value.getUTCMonth() + 1).padStart(2, '0');
        const day = String(value.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      if (typeof value !== 'string') {
        throw new FieldDataError('Must be a string');
      }
      return value;
    },
    serialize(value) {
      if (value === null) return {
        value: undefined
      };
      const date = new Date(value);
      date.toISOString = () => value;
      date.toString = () => value;
      return {
        value: date
      };
    },
    validate(value) {
      const message = validateDate(validation, value, label);
      if (message !== undefined) {
        throw new FieldDataError(message);
      }
      assertRequired(value, validation, label);
      return value;
    }
  });
}

function validateDatetime(validation, value, label) {
  if (value !== null && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${label} is not a valid datetime`;
  }
  if (validation !== null && validation !== void 0 && validation.isRequired && value === null) {
    return `${label} is required`;
  }
  if ((validation !== null && validation !== void 0 && validation.min || validation !== null && validation !== void 0 && validation.max) && value !== null) {
    const datetime = new Date(value);
    if ((validation === null || validation === void 0 ? void 0 : validation.min) !== undefined) {
      const min = new Date(validation.min);
      if (datetime < min) {
        return `${label} must be after ${min.toISOString()}`;
      }
    }
    if ((validation === null || validation === void 0 ? void 0 : validation.max) !== undefined) {
      const max = new Date(validation.max);
      if (datetime > max) {
        return `${label} must be no later than ${max.toISOString()}`;
      }
    }
  }
}

function datetime({
  label,
  defaultValue,
  validation,
  description
}) {
  return basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return /*#__PURE__*/jsx(DatetimeFieldInput, {
        validation: validation,
        label: label,
        description: description,
        ...props
      });
    },
    defaultValue() {
      if (defaultValue === undefined) {
        return null;
      }
      if (typeof defaultValue === 'string') {
        return defaultValue;
      }
      if (defaultValue.kind === 'now') {
        const now = new Date();
        return new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, -8);
      }
      return null;
    },
    parse(value) {
      if (value === undefined) {
        return null;
      }
      if (value instanceof Date) {
        return value.toISOString().slice(0, -8);
      }
      if (typeof value !== 'string') {
        throw new FieldDataError('Must be a string or date');
      }
      return value;
    },
    serialize(value) {
      if (value === null) return {
        value: undefined
      };
      const date = new Date(value + 'Z');
      date.toJSON = () => date.toISOString().slice(0, -8);
      date.toString = () => date.toISOString().slice(0, -8);
      return {
        value: date
      };
    },
    validate(value) {
      const message = validateDatetime(validation, value, label);
      if (message !== undefined) {
        throw new FieldDataError(message);
      }
      assertRequired(value, validation, label);
      return value;
    }
  });
}

function empty() {
  return basicFormFieldWithSimpleReaderParse({
    Input() {
      return null;
    },
    defaultValue() {
      return null;
    },
    parse() {
      return null;
    },
    serialize() {
      return {
        value: undefined
      };
    },
    validate(value) {
      return value;
    },
    label: 'Empty'
  });
}

/**
 * @deprecated `emptyDocument` has been replaced with the `emptyContent` field
 */
function emptyDocument() {
  return {
    kind: 'form',
    formKind: 'content',
    Input() {
      return null;
    },
    defaultValue() {
      return null;
    },
    parse() {
      return null;
    },
    contentExtension: '.mdoc',
    serialize() {
      return {
        value: undefined,
        content: new Uint8Array(),
        external: new Map(),
        other: new Map()
      };
    },
    validate(value) {
      return value;
    },
    reader: {
      parse() {
        return null;
      }
    }
  };
}

function emptyContent(opts) {
  return {
    kind: 'form',
    formKind: 'content',
    Input() {
      return null;
    },
    defaultValue() {
      return null;
    },
    parse() {
      return null;
    },
    contentExtension: `.${opts.extension}`,
    serialize() {
      return {
        value: undefined,
        content: new Uint8Array(),
        external: new Map(),
        other: new Map()
      };
    },
    validate(value) {
      return value;
    },
    reader: {
      parse() {
        return null;
      }
    }
  };
}

function file({
  label,
  directory,
  validation,
  description,
  publicPath,
  transformFilename
}) {
  return {
    kind: 'form',
    formKind: 'asset',
    label,
    Input(props) {
      return /*#__PURE__*/jsx(FileFieldInput, {
        label: label,
        description: description,
        validation: validation,
        transformFilename: transformFilename,
        ...props
      });
    },
    defaultValue() {
      return null;
    },
    filename(value, args) {
      if (typeof value === 'string') {
        return value.slice(getSrcPrefix(publicPath, args.slug).length);
      }
      return undefined;
    },
    parse(value, args) {
      var _value$match$, _value$match;
      if (value === undefined) {
        return null;
      }
      if (typeof value !== 'string') {
        throw new FieldDataError('Must be a string');
      }
      if (args.asset === undefined) {
        return null;
      }
      return {
        data: args.asset,
        filename: value.slice(getSrcPrefix(publicPath, args.slug).length),
        extension: (_value$match$ = (_value$match = value.match(/\.([^.]+$)/)) === null || _value$match === void 0 ? void 0 : _value$match[1]) !== null && _value$match$ !== void 0 ? _value$match$ : ''
      };
    },
    validate(value) {
      assertRequired(value, validation, label);
      return value;
    },
    serialize(value, args) {
      if (value === null) {
        return {
          value: undefined,
          asset: undefined
        };
      }
      const filename = args.suggestedFilenamePrefix ? args.suggestedFilenamePrefix + '.' + value.extension : value.filename;
      return {
        value: `${getSrcPrefix(publicPath, args.slug)}${filename}`,
        asset: {
          filename,
          content: value.data
        }
      };
    },
    directory: directory ? fixPath(directory) : undefined,
    reader: {
      parse(value) {
        if (typeof value !== 'string' && value !== undefined) {
          throw new FieldDataError('Must be a string');
        }
        const val = value === undefined ? null : value;
        assertRequired(val, validation, label);
        return val;
      }
    }
  };
}

function image({
  label,
  directory,
  validation,
  description,
  publicPath,
  transformFilename
}) {
  return {
    kind: 'form',
    formKind: 'asset',
    label,
    Input(props) {
      return /*#__PURE__*/jsx(ImageFieldInput, {
        label: label,
        description: description,
        validation: validation,
        transformFilename: transformFilename,
        ...props
      });
    },
    defaultValue() {
      return null;
    },
    filename(value, args) {
      if (typeof value === 'string') {
        return value.slice(getSrcPrefix(publicPath, args.slug).length);
      }
      return undefined;
    },
    parse(value, args) {
      var _value$match$, _value$match;
      if (value === undefined) {
        return null;
      }
      if (typeof value !== 'string') {
        throw new FieldDataError('Must be a string');
      }
      if (args.asset === undefined) {
        return null;
      }
      return {
        data: args.asset,
        filename: value.slice(getSrcPrefix(publicPath, args.slug).length),
        extension: (_value$match$ = (_value$match = value.match(/\.([^.]+$)/)) === null || _value$match === void 0 ? void 0 : _value$match[1]) !== null && _value$match$ !== void 0 ? _value$match$ : ''
      };
    },
    validate(value) {
      assertRequired(value, validation, label);
      return value;
    },
    serialize(value, args) {
      if (value === null) {
        return {
          value: undefined,
          asset: undefined
        };
      }
      const filename = args.suggestedFilenamePrefix ? args.suggestedFilenamePrefix + '.' + value.extension : value.filename;
      return {
        value: `${getSrcPrefix(publicPath, args.slug)}${filename}`,
        asset: {
          filename,
          content: value.data
        }
      };
    },
    directory: directory ? fixPath(directory) : undefined,
    reader: {
      parse(value) {
        if (typeof value !== 'string' && value !== undefined) {
          throw new FieldDataError('Must be a string');
        }
        const val = value === undefined ? null : value;
        assertRequired(val, validation, label);
        return val;
      }
    }
  };
}

function pluralize(count, options) {
  const {
    singular,
    plural = singular + 's',
    inclusive = true
  } = options;
  const variant = count === 1 ? singular : plural;
  return inclusive ? `${count} ${variant}` : variant;
}

function validateMultiRelationshipLength(validation, value) {
  var _validation$length$mi, _validation$length, _validation$length$ma, _validation$length2;
  const minLength = (_validation$length$mi = validation === null || validation === void 0 || (_validation$length = validation.length) === null || _validation$length === void 0 ? void 0 : _validation$length.min) !== null && _validation$length$mi !== void 0 ? _validation$length$mi : 0;
  if (value.length < minLength) {
    return `Must have at least ${pluralize(minLength, {
      singular: 'item'
    })}.`;
  }
  const maxLength = (_validation$length$ma = validation === null || validation === void 0 || (_validation$length2 = validation.length) === null || _validation$length2 === void 0 ? void 0 : _validation$length2.max) !== null && _validation$length$ma !== void 0 ? _validation$length$ma : Infinity;
  if (value.length > maxLength) {
    return `Must have at most ${pluralize(maxLength, {
      singular: 'item'
    })}.`;
  }
}

function multiRelationship({
  label,
  collection,
  validation,
  description
}) {
  return basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return /*#__PURE__*/jsx(MultiRelationshipInput, {
        label: label,
        collection: collection,
        description: description,
        validation: validation,
        ...props
      });
    },
    defaultValue() {
      return [];
    },
    parse(value) {
      if (value === undefined) {
        return [];
      }
      if (!Array.isArray(value) || !value.every(isString)) {
        throw new FieldDataError('Must be an array of strings');
      }
      return value;
    },
    validate(value) {
      const error = validateMultiRelationshipLength(validation, value);
      if (error) {
        throw new FieldDataError(error);
      }
      return value;
    },
    serialize(value) {
      return {
        value
      };
    }
  });
}

function multiselect({
  label,
  options,
  defaultValue = [],
  description
}) {
  const valuesToOption = new Map(options.map(x => [x.value, x]));
  const field = basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return /*#__PURE__*/jsx(MultiselectFieldInput, {
        label: label,
        description: description,
        options: options,
        ...props
      });
    },
    defaultValue() {
      return defaultValue;
    },
    parse(value) {
      if (value === undefined) {
        return [];
      }
      if (!Array.isArray(value)) {
        throw new FieldDataError('Must be an array of options');
      }
      if (!value.every(x => typeof x === 'string' && valuesToOption.has(x))) {
        throw new FieldDataError(`Must be an array with one of ${options.map(x => x.value).join(', ')}`);
      }
      return value;
    },
    validate(value) {
      return value;
    },
    serialize(value) {
      return {
        value
      };
    }
  });
  return {
    ...field,
    options
  };
}

function validateNumber(validation, value, step, label) {
  if (value !== null && typeof value !== 'number') {
    return `${label} must be a number`;
  }
  if (validation !== null && validation !== void 0 && validation.isRequired && value === null) {
    return `${label} is required`;
  }
  if (value !== null) {
    if ((validation === null || validation === void 0 ? void 0 : validation.min) !== undefined && value < validation.min) {
      return `${label} must be at least ${validation.min}`;
    }
    if ((validation === null || validation === void 0 ? void 0 : validation.max) !== undefined && value > validation.max) {
      return `${label} must be at most ${validation.max}`;
    }
    if (step !== undefined && (validation === null || validation === void 0 ? void 0 : validation.validateStep) !== undefined && !isAtStep(value, step)) {
      return `${label} must be a multiple of ${step}`;
    }
  }
}
function decimalPlaces(value) {
  const stringified = value.toString();
  const indexOfDecimal = stringified.indexOf('.');
  if (indexOfDecimal === -1) {
    const indexOfE = stringified.indexOf('e-');
    return indexOfE === -1 ? 0 : parseInt(stringified.slice(indexOfE + 2));
  }
  return stringified.length - indexOfDecimal - 1;
}
function isAtStep(value, step) {
  const dc = Math.max(decimalPlaces(step), decimalPlaces(value));
  const base = Math.pow(10, dc);
  return value * base % (step * base) === 0;
}

function number({
  label,
  defaultValue,
  step,
  validation,
  description
}) {
  return basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return /*#__PURE__*/jsx(NumberFieldInput, {
        label: label,
        description: description,
        validation: validation,
        step: step,
        ...props
      });
    },
    defaultValue() {
      return defaultValue !== null && defaultValue !== void 0 ? defaultValue : null;
    },
    parse(value) {
      if (value === undefined) {
        return null;
      }
      if (typeof value === 'number') {
        return value;
      }
      throw new FieldDataError('Must be a number');
    },
    validate(value) {
      const message = validateNumber(validation, value, step, label);
      if (message !== undefined) {
        throw new FieldDataError(message);
      }
      assertRequired(value, validation, label);
      return value;
    },
    serialize(value) {
      return {
        value: value === null ? undefined : value
      };
    }
  });
}

function pathReference({
  label,
  pattern,
  validation,
  description
}) {
  return basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return /*#__PURE__*/jsx(PathReferenceInput, {
        label: label,
        pattern: pattern,
        description: description,
        validation: validation,
        ...props
      });
    },
    defaultValue() {
      return null;
    },
    parse(value) {
      if (value === undefined) {
        return null;
      }
      if (typeof value !== 'string') {
        throw new FieldDataError('Must be a string');
      }
      return value;
    },
    validate(value) {
      assertRequired(value, validation, label);
      return value;
    },
    serialize(value) {
      return {
        value: value === null ? undefined : value
      };
    }
  });
}

function relationship({
  label,
  collection,
  validation,
  description
}) {
  return basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return /*#__PURE__*/jsx(RelationshipInput, {
        label: label,
        collection: collection,
        description: description,
        validation: validation,
        ...props
      });
    },
    defaultValue() {
      return null;
    },
    parse(value) {
      if (value === undefined) {
        return null;
      }
      if (typeof value !== 'string') {
        throw new FieldDataError('Must be a string');
      }
      return value;
    },
    validate(value) {
      assertRequired(value, validation, label);
      return value;
    },
    serialize(value) {
      return {
        value: value === null ? undefined : value
      };
    }
  });
}

function parseSlugFieldAsNormalField(value) {
  if (value === undefined) {
    return {
      name: '',
      slug: ''
    };
  }
  if (typeof value !== 'object') {
    throw new FieldDataError('Must be an object');
  }
  if (Object.keys(value).length !== 2) {
    throw new FieldDataError('Unexpected keys');
  }
  if (!('name' in value) || !('slug' in value)) {
    throw new FieldDataError('Missing name or slug');
  }
  if (typeof value.name !== 'string') {
    throw new FieldDataError('name must be a string');
  }
  if (typeof value.slug !== 'string') {
    throw new FieldDataError('slug must be a string');
  }
  return {
    name: value.name,
    slug: value.slug
  };
}
function parseAsSlugField(value, slug) {
  if (value === undefined) {
    return {
      name: '',
      slug
    };
  }
  if (typeof value !== 'string') {
    throw new FieldDataError('Must be a string');
  }
  return {
    name: value,
    slug
  };
}
function slug(_args) {
  var _args$name$validation, _args$name$validation2, _args$name$validation3, _args$name$validation4, _args$name$validation5, _args$slug;
  const args = {
    ..._args,
    name: {
      ..._args.name,
      validation: {
        pattern: (_args$name$validation = _args.name.validation) === null || _args$name$validation === void 0 ? void 0 : _args$name$validation.pattern,
        length: {
          min: Math.max((_args$name$validation2 = _args.name.validation) !== null && _args$name$validation2 !== void 0 && _args$name$validation2.isRequired ? 1 : 0, (_args$name$validation3 = (_args$name$validation4 = _args.name.validation) === null || _args$name$validation4 === void 0 || (_args$name$validation4 = _args$name$validation4.length) === null || _args$name$validation4 === void 0 ? void 0 : _args$name$validation4.min) !== null && _args$name$validation3 !== void 0 ? _args$name$validation3 : 0),
          max: (_args$name$validation5 = _args.name.validation) === null || _args$name$validation5 === void 0 || (_args$name$validation5 = _args$name$validation5.length) === null || _args$name$validation5 === void 0 ? void 0 : _args$name$validation5.max
        }
      }
    }
  };
  const naiveGenerateSlug = ((_args$slug = args.slug) === null || _args$slug === void 0 ? void 0 : _args$slug.generate) || slugify;
  let _defaultValue;
  function defaultValue() {
    if (!_defaultValue) {
      var _args$name$defaultVal, _args$name$defaultVal2;
      _defaultValue = {
        name: (_args$name$defaultVal = args.name.defaultValue) !== null && _args$name$defaultVal !== void 0 ? _args$name$defaultVal : '',
        slug: naiveGenerateSlug((_args$name$defaultVal2 = args.name.defaultValue) !== null && _args$name$defaultVal2 !== void 0 ? _args$name$defaultVal2 : '')
      };
    }
    return _defaultValue;
  }
  function validate(value, {
    slugField
  } = {
    slugField: undefined
  }) {
    var _args$name$validation6, _args$name$validation7, _args$name$validation8, _args$name$validation9, _args$name$validation10, _args$slug$validation, _args$slug2, _args$slug$validation2, _args$slug3, _args$slug$label, _args$slug4, _args$slug5;
    const nameMessage = validateText(value.name, (_args$name$validation6 = (_args$name$validation7 = args.name.validation) === null || _args$name$validation7 === void 0 || (_args$name$validation7 = _args$name$validation7.length) === null || _args$name$validation7 === void 0 ? void 0 : _args$name$validation7.min) !== null && _args$name$validation6 !== void 0 ? _args$name$validation6 : 0, (_args$name$validation8 = (_args$name$validation9 = args.name.validation) === null || _args$name$validation9 === void 0 || (_args$name$validation9 = _args$name$validation9.length) === null || _args$name$validation9 === void 0 ? void 0 : _args$name$validation9.max) !== null && _args$name$validation8 !== void 0 ? _args$name$validation8 : Infinity, args.name.label, undefined, (_args$name$validation10 = args.name.validation) === null || _args$name$validation10 === void 0 ? void 0 : _args$name$validation10.pattern);
    if (nameMessage !== undefined) {
      throw new FieldDataError(nameMessage);
    }
    const slugMessage = validateText(value.slug, (_args$slug$validation = (_args$slug2 = args.slug) === null || _args$slug2 === void 0 || (_args$slug2 = _args$slug2.validation) === null || _args$slug2 === void 0 || (_args$slug2 = _args$slug2.length) === null || _args$slug2 === void 0 ? void 0 : _args$slug2.min) !== null && _args$slug$validation !== void 0 ? _args$slug$validation : 1, (_args$slug$validation2 = (_args$slug3 = args.slug) === null || _args$slug3 === void 0 || (_args$slug3 = _args$slug3.validation) === null || _args$slug3 === void 0 || (_args$slug3 = _args$slug3.length) === null || _args$slug3 === void 0 ? void 0 : _args$slug3.max) !== null && _args$slug$validation2 !== void 0 ? _args$slug$validation2 : Infinity, (_args$slug$label = (_args$slug4 = args.slug) === null || _args$slug4 === void 0 ? void 0 : _args$slug4.label) !== null && _args$slug$label !== void 0 ? _args$slug$label : 'Slug', slugField ? slugField : {
      slugs: emptySet,
      glob: '*'
    }, (_args$slug5 = args.slug) === null || _args$slug5 === void 0 || (_args$slug5 = _args$slug5.validation) === null || _args$slug5 === void 0 ? void 0 : _args$slug5.pattern);
    if (slugMessage !== undefined) {
      throw new FieldDataError(slugMessage);
    }
    return value;
  }
  const emptySet = new Set();
  return {
    kind: 'form',
    formKind: 'slug',
    label: args.name.label,
    Input(props) {
      return /*#__PURE__*/jsx(SlugFieldInput, {
        args: args,
        naiveGenerateSlug: naiveGenerateSlug,
        defaultValue: defaultValue(),
        ...props
      });
    },
    defaultValue,
    parse(value, args) {
      if ((args === null || args === void 0 ? void 0 : args.slug) !== undefined) {
        return parseAsSlugField(value, args.slug);
      }
      return parseSlugFieldAsNormalField(value);
    },
    validate,
    serialize(value) {
      return {
        value
      };
    },
    serializeWithSlug(value) {
      return {
        value: value.name,
        slug: value.slug
      };
    },
    reader: {
      parse(value) {
        const parsed = parseSlugFieldAsNormalField(value);
        return validate(parsed);
      },
      parseWithSlug(value, args) {
        return validate(parseAsSlugField(value, args.slug), {
          slugField: {
            glob: args.glob,
            slugs: emptySet
          }
        }).name;
      }
    }
  };
}

function isValidURL(url) {
  return url === sanitizeUrl(url);
}

function validateUrl(validation, value, label) {
  if (value !== null && (typeof value !== 'string' || !isValidURL(value))) {
    return `${label} is not a valid URL`;
  }
  if (validation !== null && validation !== void 0 && validation.isRequired && value === null) {
    return `${label} is required`;
  }
}

function url({
  label,
  defaultValue,
  validation,
  description
}) {
  return basicFormFieldWithSimpleReaderParse({
    label,
    Input(props) {
      return /*#__PURE__*/jsx(UrlFieldInput, {
        label: label,
        description: description,
        validation: validation,
        ...props
      });
    },
    defaultValue() {
      return defaultValue || null;
    },
    parse(value) {
      if (value === undefined) {
        return null;
      }
      if (typeof value !== 'string') {
        throw new FieldDataError('Must be a string');
      }
      return value === '' ? null : value;
    },
    validate(value) {
      const message = validateUrl(validation, value, label);
      if (message !== undefined) {
        throw new FieldDataError(message);
      }
      assertRequired(value, validation, label);
      return value;
    },
    serialize(value) {
      return {
        value: value === null ? undefined : value
      };
    }
  });
}

function ignored() {
  return {
    kind: 'form',
    Input() {
      return null;
    },
    defaultValue() {
      return {
        value: undefined
      };
    },
    parse(value) {
      return {
        value
      };
    },
    serialize(value) {
      return value;
    },
    validate(value) {
      return value;
    },
    label: 'Ignored',
    reader: {
      parse(value) {
        return value;
      }
    }
  };
}

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  array: array,
  blocks: blocks,
  checkbox: checkbox,
  child: child,
  cloudImage: cloudImage,
  conditional: conditional,
  date: date,
  datetime: datetime,
  document: document,
  empty: empty,
  emptyDocument: emptyDocument,
  emptyContent: emptyContent,
  file: file,
  image: image,
  integer: integer,
  multiRelationship: multiRelationship,
  multiselect: multiselect,
  number: number,
  object: object,
  pathReference: pathReference,
  relationship: relationship,
  select: select,
  slug: slug,
  text: text,
  url: url,
  ignored: ignored,
  mdx: mdx,
  markdoc: markdoc
});

({
  src: text({
    label: 'URL',
    validation: {
      length: {
        min: 1
      }
    }
  }),
  alt: text({
    label: 'Alt text'
  }),
  height: integer({
    label: 'Height'
  }),
  width: integer({
    label: 'Width'
  })
});

function wrapper(config) {
  return {
    kind: 'wrapper',
    ...config
  };
}
function block(config) {
  return {
    kind: 'block',
    ...config
  };
}

const IconList = [
	{
		label: "Dentista di qualità",
		value: "dentist-quality"
	},
	{
		label: "Sedia dentista",
		value: "dental-chair"
	},
	{
		label: "Pagamenti flessibili",
		value: "dentist-price"
	},
	{
		label: "Clinica dentale",
		value: "dental-clinic"
	},
	{
		label: "Whatsapp",
		value: "whatsapp"
	}
];

function GeneralIcon({ ariaHidden = true }) {
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: [
    /* @__PURE__ */ jsx("title", { children: "General" }),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#000",
        d: "M12.8838 5.07315C12.3957 4.58499 11.6042 4.58499 11.116 5.07315L9.32315 6.86604C8.83499 7.3542 8.83499 8.14565 9.32315 8.63381L11.116 10.4267C11.6042 10.9149 12.3957 10.9149 12.8838 10.4267L14.6767 8.63381C15.1649 8.14565 15.1649 7.3542 14.6767 6.86604L12.8838 5.07315zM8.63381 9.32315C8.14565 8.83499 7.3542 8.83499 6.86604 9.32315L5.07315 11.116C4.58499 11.6042 4.58499 12.3957 5.07315 12.8838L6.86604 14.6767C7.3542 15.1649 8.14565 15.1649 8.63381 14.6767L10.4267 12.8838C10.9149 12.3957 10.9149 11.6042 10.4267 11.116L8.63381 9.32315zM12.8838 13.5731C12.3957 13.085 11.6042 13.085 11.116 13.5731L9.32315 15.366C8.83499 15.8542 8.83499 16.6457 9.32315 17.1338L11.116 18.9267C11.6042 19.4149 12.3957 19.4149 12.8838 18.9267L14.6767 17.1338C15.1649 16.6457 15.1649 15.8542 14.6767 15.366L12.8838 13.5731zM17.1338 9.32315C16.6457 8.83499 15.8542 8.83499 15.366 9.32315L13.5731 11.116C13.085 11.6042 13.085 12.3957 13.5731 12.8838L15.366 14.6767C15.8542 15.1649 16.6457 15.1649 17.1338 14.6767L18.9267 12.8838C19.4149 12.3957 19.4149 11.6042 18.9267 11.116L17.1338 9.32315z"
      }
    )
  ] });
}
function ContactIcon({ ariaHidden = true }) {
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 512 512", id: "Mail", children: [
    /* @__PURE__ */ jsx("title", { children: "Contact" }),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M445.011,82.7H67.022a50.057,50.057,0,0,0-50,50V379.3a50.057,50.057,0,0,0,50,50H445.01a50.057,50.057,0,0,0,50-50V132.7A50.055,50.055,0,0,0,445.011,82.7Zm-88.9,173.232,118.9-93.318V371.352ZM67.022,102.7H445.01a30.034,30.034,0,0,1,30,30v4.49L282.6,288.208a39.972,39.972,0,0,1-49.246-.04L37.022,137.152V132.7A30.034,30.034,0,0,1,67.022,102.7Zm92.438,153.86L37.022,371.755V162.384ZM445.011,409.3H67.022a30.007,30.007,0,0,1-25.538-14.28l134.034-126.1L221.1,303.98a59.937,59.937,0,0,0,73.816-.019L340.235,268.4,470.6,394.94A30.011,30.011,0,0,1,445.011,409.3Z",
        fill: "#202020"
      }
    )
  ] });
}
function ContainerFluidIcon({ ariaHidden = true }) {
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", id: "Container", x: "0", y: "0", version: "1.1", viewBox: "0 0 128 128", children: [
    /* @__PURE__ */ jsx("title", { children: "Container Fluid" }),
    /* @__PURE__ */ jsxs("g", { fill: "#000000", children: [
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M70.9,26.8H54.1c-1.1,0-2-0.9-2-2V13.1c0-1.1,0.9-2,2-2h16.9c1.1,0,2,0.9,2,2v11.7    C72.9,25.9,72,26.8,70.9,26.8z M56.1,22.8h12.9v-7.7H56.1V22.8z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M57.6,15.1c-1.1,0-2-0.9-2-2V2.5c0-1.1,0.9-2,2-2s2,0.9,2,2v10.6C59.5,14.2,58.6,15.1,57.6,15.1z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M67.4,15.1c-1.1,0-2-0.9-2-2V2.5c0-1.1,0.9-2,2-2s2,0.9,2,2v10.6C69.4,14.2,68.5,15.1,67.4,15.1z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M63.2,46.6c-3.4,0-6.2-2.8-6.2-6.2c0-1.1,0.9-2,2-2s2,0.9,2,2c0,1.2,1,2.3,2.3,2.3c1.2,0,2.3-1,2.3-2.3    c0-1.2-1-2.3-2.3-2.3c-1.1,0-2-0.9-2-2V24.8c0-1.1,0.9-2,2-2c1.1,0,2,0.9,2,2v9.7c2.5,0.8,4.2,3.2,4.2,5.9    C69.5,43.8,66.7,46.6,63.2,46.6z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M16.1,75.4c-0.7,0-1.3-0.3-1.7-1c-0.6-0.9-0.3-2.2,0.7-2.7L63,42.9c0.6-0.4,1.4-0.4,2,0l47.9,28.8    c0.9,0.6,1.2,1.8,0.7,2.7c-0.6,0.9-1.8,1.2-2.7,0.7L64,46.9L17.1,75.1C16.8,75.3,16.5,75.4,16.1,75.4z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M114.8,127.5H13.2c-1.1,0-2-0.9-2-2V73.4c0-1.1,0.9-2,2-2h101.6c1.1,0,2,0.9,2,2v52.1    C116.8,126.6,115.9,127.5,114.8,127.5z M15.2,123.5h97.6V75.4H15.2V123.5z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M37.9,120c-0.5,0-1-0.4-1-1V79.9c0-0.5,0.4-1,1-1c0.5,0,1,0.4,1,1V119C38.9,119.6,38.5,120,37.9,120z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M24.8,120c-0.5,0-1-0.4-1-1V79.9c0-0.5,0.4-1,1-1c0.5,0,1,0.4,1,1V119C25.8,119.6,25.4,120,24.8,120z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M51,120c-0.5,0-1-0.4-1-1V79.9c0-0.5,0.4-1,1-1c0.5,0,1,0.4,1,1V119C52,119.6,51.5,120,51,120z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M64,120c-0.5,0-1-0.4-1-1V79.9c0-0.5,0.4-1,1-1c0.5,0,1,0.4,1,1V119C65,119.6,64.5,120,64,120z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M77,120c-0.5,0-1-0.4-1-1V79.9c0-0.5,0.4-1,1-1c0.5,0,1,0.4,1,1V119C78,119.6,77.6,120,77,120z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M90.1,120c-0.5,0-1-0.4-1-1V79.9c0-0.5,0.4-1,1-1c0.5,0,1,0.4,1,1V119C91.1,119.6,90.6,120,90.1,120z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M103.1,120c-0.5,0-1-0.4-1-1V79.9c0-0.5,0.4-1,1-1c0.5,0,1,0.4,1,1V119C104.1,119.6,103.7,120,103.1,120z"
        }
      ) })
    ] })
  ] });
}
function ContainerIcon({ ariaHidden = true }) {
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", id: "Container", x: "0", y: "0", version: "1.1", viewBox: "0 0 128 128", children: [
    /* @__PURE__ */ jsx("title", { children: "Container" }),
    /* @__PURE__ */ jsxs("g", { fill: "#000000", children: [
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M75.4,39.8H50.5c-1.1,0-2-0.9-2-2v-20c0-1.1,0.9-2,2-2h24.9c1.1,0,2,0.9,2,2v20    C77.3,38.9,76.5,39.8,75.4,39.8z M52.5,35.8h20.9v-16H52.5V35.8z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M67.4,30.9c-0.5,0-1-0.4-1-1v-3.1h-8c-0.5,0-1-0.4-1-1c0-0.5,0.4-1,1-1h9c0.5,0,1,0.4,1,1v4.1    C68.4,30.4,68,30.9,67.4,30.9z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M55.6,19.8c-1.1,0-2-0.9-2-2V2.5c0-1.1,0.9-2,2-2s2,0.9,2,2v15.4C57.6,18.9,56.7,19.8,55.6,19.8z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M70.2,19.8c-1.1,0-2-0.9-2-2V2.5c0-1.1,0.9-2,2-2c1.1,0,2,0.9,2,2v15.4C72.2,18.9,71.3,19.8,70.2,19.8z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M64,50c-4.5,0-8.2-3.7-8.2-8.2v-4c0-1.1,0.9-2,2-2h12.4c1.1,0,2,0.9,2,2v4C72.2,46.3,68.5,50,64,50z     M59.8,39.8v2c0,2.3,1.9,4.2,4.2,4.2c2.3,0,4.2-1.9,4.2-4.2v-2H59.8z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M64,69.1c-4.6,0-8.3-3.7-8.3-8.3c0-1.1,0.9-2,2-2s2,0.9,2,2c0,2.4,1.9,4.3,4.3,4.3c2.4,0,4.3-1.9,4.3-4.3    c0-2.4-1.9-4.3-4.3-4.3c-1.1,0-2-0.9-2-2V48c0-1.1,0.9-2,2-2c1.1,0,2,0.9,2,2v4.8c3.6,0.9,6.3,4.1,6.3,8    C72.3,65.4,68.6,69.1,64,69.1z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M89.1,127.5H38.9c-1.1,0-2-0.9-2-2V80.7c0-1.1,0.9-2,2-2h50.2c1.1,0,2,0.9,2,2v44.8    C91.1,126.6,90.2,127.5,89.1,127.5z M40.9,123.5h46.2V82.7H40.9V123.5z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M81.1,118.6c-0.5,0-1-0.4-1-1v-28H46.9c-0.5,0-1-0.4-1-1c0-0.5,0.4-1,1-1h34.3c0.5,0,1,0.4,1,1v28.9    C82.1,118.1,81.7,118.6,81.1,118.6z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M76.6,82.7c-0.5,0-1.1-0.2-1.5-0.6L64,70L52.9,82c-0.7,0.8-2,0.9-2.8,0.1c-0.8-0.7-0.9-2-0.1-2.8l12.6-13.6    c0.8-0.8,2.2-0.8,2.9,0L78,79.3c0.7,0.8,0.7,2.1-0.1,2.8C77.6,82.5,77.1,82.7,76.6,82.7z"
        }
      ) })
    ] })
  ] });
}
function FlexboxIcon({ ariaHidden = true }) {
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 48 48", id: "Flexbox", children: [
    /* @__PURE__ */ jsx("title", { children: "Flexbox" }),
    /* @__PURE__ */ jsxs("g", { color: "#000", fill: "#202020", children: [
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M1603.2 620.97a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zm3.8 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zm3.9 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z",
          fill: "#b3b3b3",
          transform: "translate(-1591.9 -610.78)"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M1602.7 616.78a4.788 4.788 0 0 0-4.777 4.777v7.766a1 1 0 1 0 2 0v-7.766a2.75 2.75 0 0 1 2.777-2.777h26.445a2.75 2.75 0 0 1 2.778 2.777v12.338a1 1 0 1 0 2 0v-12.338a4.789 4.789 0 0 0-4.778-4.777zm-3.8 15.54a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0 4a1 1 0 0 0-1 1V648a4.788 4.788 0 0 0 4.777 4.777h26.445A4.789 4.789 0 0 0 1633.9 648v-10.108a1 1 0 0 0-2 0V648a2.75 2.75 0 0 1-2.778 2.777h-26.445A2.75 2.75 0 0 1 1599.9 648v-10.68a1 1 0 0 0-1-1z",
          fill: "#959595",
          transform: "translate(-1591.9 -610.78)"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M1615.2 621.22a1 1 0 0 0 0 2h13.416a1 1 0 1 0 0-2z",
          fill: "#959595",
          transform: "translate(-1591.9 -610.78)"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M1617.9 638.78a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1zm0-12a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1zm-15 0a1 1 0 0 0-1 1v20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-20a1 1 0 0 0-1-1z",
          fill: "#b3b3b3",
          transform: "translate(-1591.9 -610.78)"
        }
      )
    ] })
  ] });
}
function HeroIcon({ ariaHidden = true }) {
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 100 100", children: [
    /* @__PURE__ */ jsx("title", { children: "Hero" }),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M88.974 44.991c-.285-.067-7.277-1.462-17.493-4.301-.872-.235-1.828.3-2.065 1.17l-.003.007c-.118.42-.067.873.151 1.277.218.386.589.671 1.009.789 7.512 2.084 13.326 3.412 16.166 4.018a51.776 51.776 0 0 1-1.142 4.789c-1.396 4.764-3.783 10.778-7.781 16.432L67.79 58.765a5.738 5.738 0 0 0-1.386-2.851L50.543 35.87a129.661 129.661 0 0 0 7.138 3.476c.824.37 1.85-.035 2.219-.858l.003-.012c.181-.399.197-.849.031-1.265a1.662 1.662 0 0 0-.875-.941c-5.672-2.531-10.737-5.39-13.362-6.941-1.321-1.525-3.568-2.163-5.503-1.504a10.382 10.382 0 0 0-.331-4.936c-.725-2.316-2.174-4.267-4.077-5.495-2-1.29-4.259-1.639-6.361-.978a7.077 7.077 0 0 0-2.535 1.429l-7.273-6.499a5.783 5.783 0 0 0-4.101-1.68h-.033a5.833 5.833 0 0 0-4.538 2.168c-.823.992-1.277 2.285-1.277 3.612 0 1.648.655 3.21 1.814 4.403l17.583 18.252c-.028.328-.052.658-.055.99 0 1.481.293 3.95 1.852 6.628 2.932 6.271 5.135 12.812 6.634 19.713a8.342 8.342 0 0 0-1.696 5.401 8.342 8.342 0 0 0 2.748 5.89c.065.059.135.113.208.161l.588.386c.364 3.687.556 7.476.573 11.382 0 .924.756 1.68 1.681 1.68h.117c5.472 0 10.319-.708 14.616-1.916l.482.316a5.858 5.858 0 0 0 4.04 1.6h.03a5.78 5.78 0 0 0 4.127-1.741c.87-.888 1.246-1.984 1.087-3.172a4.401 4.401 0 0 0-.237-.904 42.61 42.61 0 0 0 5.607-3.72l8.741 7.807a5.88 5.88 0 0 0 4.454 1.717 5.912 5.912 0 0 0 4.267-2.161c1.886-2.303 1.635-5.834-.549-8.019l-8.163-8.474a50.98 50.98 0 0 0 2.101-3.129c6.336-10.253 7.848-20.522 8.001-21.664v-.032a1.687 1.687 0 0 0-1.345-1.849zM86.33 86.03a2.507 2.507 0 0 1-1.833.932c-.721.058-1.398-.223-1.979-.801L74.055 78.6l-1.266-1.131-1.285-1.148-12.063-10.776a1.678 1.678 0 0 0-1.71-.32l-11.237 4.223a1.68 1.68 0 0 0-.418 2.918l11.686 8.772c.053.038.105.074.161.107a20.01 20.01 0 0 1 2.803 2.016c.5.431.953.872 1.306 1.291.41.486.686.943.736 1.314a.31.31 0 0 1-.042.23.688.688 0 0 1-.112.142c-.461.469-1.08.73-1.745.733-.06-.001-.121-.015-.18-.02-.593-.053-1.19-.285-1.63-.725a1.53 1.53 0 0 0-.266-.217l-.144-.095-1.819-1.193-14.323-9.398-1.786-1.172c-.018-.018-.034-.037-.052-.054a5.007 5.007 0 0 1-1.508-3.397 5 5 0 0 1 .581-2.55 5.09 5.09 0 0 1 .669-.978l.741-.506 7.03-4.8 6.152-2.051 3.096 3.712.051.051a6.275 6.275 0 0 0 4.622 2.066h.016a5.618 5.618 0 0 0 3.344-1.091 5.936 5.936 0 0 0 1.567-1.736l8.721 9.053 1.196 1.241 1.182 1.228 7.853 8.153c1 1.001 1.154 2.555.348 3.538zm-26.625-7.636-9.161-6.877 7.417-2.786 10.924 9.758a39.266 39.266 0 0 1-4.931 3.194c-1.578-1.633-3.551-2.875-4.249-3.289zm-16.442 8.544a121.274 121.274 0 0 0-.349-7.326l9.542 6.261a51.5 51.5 0 0 1-9.193 1.065zm-29.729-72.97c.504-.604 1.194-.941 1.966-.941.689 0 1.311.251 1.781.739l7.611 6.8c-.043.095-.093.185-.134.283-.863 2.093-.938 4.522-.213 6.837.163.521.363 1.019.593 1.492l-11.252-11.68a2.98 2.98 0 0 1-.857-2.052c.001-.57.169-1.074.505-1.478zm15.901 6.151c.308-.213.64-.384.997-.496a3.696 3.696 0 0 1 1.105-.167c.811 0 1.645.257 2.429.763 1.245.803 2.2 2.108 2.691 3.675.309.987.407 1.993.296 2.944a6.045 6.045 0 0 1-.41 1.607c-.028.067-.061.129-.09.194a4.68 4.68 0 0 1-.959 1.398c-.073.071-.15.134-.227.199a3.715 3.715 0 0 1-1.287.717c-.096.03-.193.049-.289.071-2.378.539-4.997-1.338-5.937-4.341-.392-1.253-.439-2.536-.156-3.701.071-.292.157-.578.271-.851.117-.285.257-.548.412-.793a4.174 4.174 0 0 1 1.154-1.219zm12.974 10.879c.37.131.692.381.898.74.028.21.092.411.198.596.043.076.089.152.145.222l.39.493 2.021 2.556 14.663 18.54 1.108 1.401 1.096 1.386.871 1.102.084.084c.404.469.638 1.058.638 1.68 0 .132-.012.259-.03.385a2.446 2.446 0 0 1-1.012 1.665c-.975.722-2.605.471-3.496-.52l-2.217-2.655-.001-.001-1.156-1.385-1.154-1.383-.002-.002-14.24-17.062a1.636 1.636 0 0 0-.437-.352c-.599-.343-1.39-.317-1.933.133a1.756 1.756 0 0 0-.211.221l-.057.076c-.448.616-.452 1.472.049 2.074 0 .016.017.016.017.016l13.38 16.038.003.003-4.156 1.386-.004-.004-11.878-11.608a14.024 14.024 0 0 1-1.762-2.092 11.164 11.164 0 0 1-.918-1.573 9.964 9.964 0 0 1-.436-1.107 9.344 9.344 0 0 1-.477-2.922l-.002-.035a8.31 8.31 0 0 1 .249-2.13c.116-.462.251-.832.356-1.08.151-.353.335-.671.504-.907.085-.084.135-.151.168-.184h.017l1.214-.609c.029-.008.057-.014.085-.023a7.082 7.082 0 0 0 2.107-1.076l1.163-.582 1.486-.744.131-.066 1.225-.614a1.52 1.52 0 0 1 .432-.152c.108-.021.216-.033.325-.033.193-.002.378.041.556.104zm-12.21 2.971c-.051.098-.102.2-.152.304l-.631-.655c.257.129.517.249.783.351zM44.79 60.114l-4.404 3.007a99.022 99.022 0 0 0-2.978-10.222l7.382 7.215zm18.288-19.071a1.682 1.682 0 0 1-.051-1.277l.007-.015c.309-.831 1.275-1.295 2.126-.994h.018c.866.301 1.3 1.26 1.013 2.129l-.006.023a1.692 1.692 0 0 1-1.58 1.109 1.64 1.64 0 0 1-.571-.102c-.017 0-.017 0-.033-.017a1.645 1.645 0 0 1-.923-.856z",
        fill: "#202020"
      }
    )
  ] });
}
function ProseIcon({ ariaHidden = true }) {
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 256 256", id: "Prose", children: [
    /* @__PURE__ */ jsx("title", { children: "Prose" }),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#e4e4e4",
        d: "M197.86,15.75v77.61c-5.47,6.64-10.12,17.9-12.21,31.1c-2.82,17.84-0.12,33.77,6.1,40.13l-2.87,18.09h-17.34\r\n	c-2.76,0-5,2.24-5,5v13.14h-10.51c-2.76,0-5,2.24-5,5v24.69H18.12c6.28,0,11.34-5.1,11.34-11.35V15.75\r\n	c0-6.24-5.06-11.34-11.34-11.34V4.4h168.4C192.8,4.4,197.86,9.5,197.86,15.75z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#c5c5c5",
        d: "M185.65 124.46c-2.82 17.84-.12 33.77 6.1 40.13l-2.87 18.09h-17.34c-2.76 0-5 2.24-5 5v13.14h-10.51c-2.76 0-5 2.24-5 5v24.69h-7v-24.69c0-6.62 5.38-12 12-12h3.51v-6.14c0-6.62 5.38-12 12-12h11.36l1.46-9.15c-13.74-20.17-5.39-69.06 13.5-82.86v9.69C192.39 100 187.74 111.26 185.65 124.46zM29.46 15.75V36.3H11.79c-2.76 0-5-2.24-5-5V16.11c0-6.25 4.9-11.6 11.15-11.7h.18C24.4 4.41 29.46 9.51 29.46 15.75zM29.458 219.164V198.61H11.794c-2.761 0-5 2.239-5 5l0 15.188c0 6.25 4.9 11.607 11.15 11.702C24.297 230.597 29.458 225.462 29.458 219.164z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M233.16,62.326c-3.729-1.228-6.641-2.022-8.591-10.421c-0.635-2.737-4.548-2.729-5.181,0\r\n	c-1.907,8.213-4.566,9.092-8.591,10.422c-2.424,0.801-2.43,4.248,0,5.051c6.686,2.209,7.444,5.476,8.591,10.421\r\n	c0.637,2.743,4.545,2.742,5.182,0c1.905-8.212,4.709-9.139,8.591-10.421C235.584,66.576,235.589,63.128,233.16,62.326z",
        fill: "#202020"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#888888",
        d: "M226.028,64.935c-1.47,1.04-2.79,2.42-3.93,4.44c-0.95-1.59-2.25-3.09-4.17-4.4\r\n	c1.55-1.06,2.94-2.51,4.12-4.64C223.248,62.495,224.618,63.925,226.028,64.935z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#afafaf",
        d: "M228.11,205.82v41.07c0,2.76-2.24,5-5,5h-67.08c-2.76,0-5-2.24-5-5v-41.07c0-2.76,2.24-5,5-5h67.08\r\n	C225.87,200.82,228.11,203.06,228.11,205.82z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#9c9c9c",
        d: "M220.86,130.04c-2.82,17.83-10.31,32.15-18.19,36.27l7.47-47.22c0.5-2.9-1.51-5.83-4.59-6.32\r\n	c-3.01-0.48-5.84,1.58-6.32,4.59l-7.48,47.23c-6.22-6.36-8.92-22.29-6.1-40.13c2.09-13.2,6.74-24.46,12.21-31.1\r\n	c3.72-4.52,7.82-6.89,11.76-6.27C219.34,88.63,224.37,107.86,220.86,130.04z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#afafaf",
        d: "M212.6,187.68v13.14h-46.06v-13.14c0-2.76,2.24-5,5-5h36.06C210.36,182.68,212.6,184.92,212.6,187.68z"
      }
    ),
    /* @__PURE__ */ jsx("rect", { width: "46.06", height: "7", x: "166.54", y: "193.82", fill: "#878787" }),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#efefef",
        d: "M210.14 119.09l-7.47 47.22-2.59 16.37h-11.2l2.87-18.09 7.48-47.23c.48-3.01 3.31-5.07 6.32-4.59C208.63 113.26 210.64 116.19 210.14 119.09zM212.1 238.26h-45.058c-1.657 0-3-1.343-3-3v-17.805c0-1.657 1.343-3 3-3H212.1c1.657 0 3 1.343 3 3v17.805C215.1 236.917 213.757 238.26 212.1 238.26z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#ffffff",
        d: "M186.991 18.253h-3c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5h3c1.381 0 2.5 1.119 2.5 2.5S188.372 18.253 186.991 18.253zM173.991 18.253H41.787c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5h132.205c1.381 0 2.5 1.119 2.5 2.5S175.372 18.253 173.991 18.253zM136.667 222.086h-81.88c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5h81.88c1.381 0 2.5 1.119 2.5 2.5S138.048 222.086 136.667 222.086zM44.787 222.086h-3c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5h3c1.381 0 2.5 1.119 2.5 2.5S46.167 222.086 44.787 222.086z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M48.119 36.611c-1.381 0-2.5 1.119-2.5 2.5v25.886c0 1.381 1.119 2.5 2.5 2.5h17.992c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5H50.619V39.111C50.619 37.73 49.5 36.611 48.119 36.611zM73.892 46.459V57.65c0 5.43 4.417 9.848 9.848 9.848h3.296c5.43 0 9.848-4.417 9.848-9.848V46.459c0-5.43-4.417-9.848-9.848-9.848H83.74C78.31 36.611 73.892 41.029 73.892 46.459zM78.892 46.459c0-2.673 2.175-4.848 4.848-4.848h3.296c2.673 0 4.848 2.175 4.848 4.848V57.65c0 2.673-2.175 4.848-4.848 4.848H83.74c-2.673 0-4.848-2.175-4.848-4.848V46.459zM125.157 46.769v-2.371c0-4.293-3.493-7.786-7.786-7.786h-12.706c-1.381 0-2.5 1.119-2.5 2.5 0 9.365 0 16.5 0 25.886 0 1.381 1.119 2.5 2.5 2.5s2.5-1.119 2.5-2.5V54.555h5.189l8.25 11.87c.788 1.133 2.345 1.414 3.479.626 1.134-.788 1.414-2.346.626-3.479l-6.318-9.091C122.203 53.978 125.157 50.715 125.157 46.769zM120.157 46.769c0 1.536-1.25 2.786-2.786 2.786h-10.206v-7.943h10.206c1.536 0 2.786 1.25 2.786 2.786V46.769zM150.93 41.611c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5h-17.992c-1.381 0-2.5 1.119-2.5 2.5v25.886c0 1.381 1.119 2.5 2.5 2.5h17.992c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5h-15.492v-7.943h15.492c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5h-15.492v-7.943H150.93zM179.202 67.498c1.381 0 2.5-1.119 2.5-2.5V39.111c0-2.441-3.162-3.432-4.553-1.427l-6.942 9.99-6.943-9.99c-1.392-2.005-4.553-1.014-4.553 1.427v25.886c0 1.381 1.119 2.5 2.5 2.5s2.5-1.119 2.5-2.5V47.089l4.443 6.393c.992 1.429 3.113 1.43 4.105 0l4.442-6.392v17.908C176.702 66.378 177.821 67.498 179.202 67.498zM76.463 93c0 1.381 1.119 2.5 2.5 2.5H164.5c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5H78.963C77.582 90.5 76.463 91.619 76.463 93zM67.644 90.5H48.12c-1.381 0-2.5 1.119-2.5 2.5s1.119 2.5 2.5 2.5h19.524c1.381 0 2.5-1.119 2.5-2.5S69.025 90.5 67.644 90.5zM45.62 109.09c0 1.381 1.119 2.5 2.5 2.5H164.5c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5H48.12C46.739 106.59 45.62 107.709 45.62 109.09zM141.369 166.94H78.963c-1.381 0-2.5 1.119-2.5 2.5s1.119 2.5 2.5 2.5h62.406c1.381 0 2.5-1.119 2.5-2.5S142.75 166.94 141.369 166.94zM48.12 171.94h19.524c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5H48.12c-1.381 0-2.5 1.119-2.5 2.5S46.739 171.94 48.12 171.94zM48.12 188.03h93.249c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5H48.12c-1.381 0-2.5 1.119-2.5 2.5S46.739 188.03 48.12 188.03zM48.12 127.68h60.61c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5H48.12c-1.381 0-2.5 1.119-2.5 2.5S46.739 127.68 48.12 127.68zM164.5 122.68h-44.451c-1.381 0-2.5 1.119-2.5 2.5s1.119 2.5 2.5 2.5H164.5c1.381 0 2.5-1.119 2.5-2.5S165.881 122.68 164.5 122.68zM167 141.271c0-1.381-1.119-2.5-2.5-2.5H48.12c-1.381 0-2.5 1.119-2.5 2.5s1.119 2.5 2.5 2.5H164.5C165.881 143.771 167 142.651 167 141.271z",
        fill: "#202020"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M11.79 38.8h15.17v102.36c0 1.38 1.12 2.5 2.5 2.5 1.38 0 2.5-1.12 2.5-2.5 0-5.802 0-119.631 0-125.41 0-3.363-1.206-6.448-3.205-8.85H76.12c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5h-58c-7.528 0-13.83 6.36-13.83 14.21V31.3C4.29 35.436 7.654 38.8 11.79 38.8zM9.29 16.11c0-4.967 3.88-9.2 8.83-9.2 4.875 0 8.84 3.965 8.84 8.84V33.8H11.79c-1.378 0-2.5-1.122-2.5-2.5V16.11zM167.042 240.76h45.059c3.033 0 5.5-2.467 5.5-5.5v-17.805c0-3.033-2.467-5.5-5.5-5.5h-45.059c-3.033 0-5.5 2.467-5.5 5.5v17.805C161.542 238.292 164.009 240.76 167.042 240.76zM166.542 217.455c0-.276.225-.5.5-.5h45.059c.275 0 .5.224.5.5v17.805c0 .276-.225.5-.5.5h-45.059c-.275 0-.5-.224-.5-.5V217.455z",
        fill: "#202020"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M176.693 228.857h25.756c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5h-25.756c-1.381 0-2.5 1.119-2.5 2.5S175.312 228.857 176.693 228.857zM219.18 109.63c.12 1.29 1.18 2.26 2.48 2.26 1.496 0 2.621-1.286 2.489-2.72v-.01c-.13-1.37-1.35-2.39-2.72-2.26C220.068 107.022 219.035 108.249 219.18 109.63z",
        fill: "#202020"
      }
    ),
    /* @__PURE__ */ jsx("circle", { cx: "29.46", cy: "151.16", r: "2.5", fill: "#202020" }),
    /* @__PURE__ */ jsx("circle", { cx: "86.12", cy: "4.4", r: "2.5", fill: "#202020" }),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M156.03,254.39h67.08c4.136,0,7.5-3.364,7.5-7.5v-41.07c0-4.136-3.364-7.5-7.5-7.5H215.1v-10.64c0-4.136-3.364-7.5-7.5-7.5\r\n	h-4.593l1.948-12.313c8.324-5.264,15.621-20.027,18.375-37.437c0,0,0-0.001,0-0.002c0.58-3.69,0.939-7.369,1.08-10.949\r\n	c0.058-1.332-0.957-2.536-2.4-2.6c-1.39-0.06-2.54,1.02-2.59,2.41c-0.13,3.39-0.48,6.87-1.03,10.36c0,0.003,0,0.005,0,0.008\r\n	c-2.041,12.899-6.753,24.394-12.231,30.6c0.028-0.179,6.392-40.409,6.448-40.763c0.719-4.226-2.173-8.479-6.663-9.193\r\n	c-4.366-0.697-8.483,2.278-9.182,6.667l-6.461,40.777c-3.289-7.602-4.22-19.995-2.18-32.895\r\n	c1.931-12.198,6.293-23.376,11.671-29.903c3.228-3.922,6.585-5.836,9.436-5.389c0.001,0,0.002,0,0.003,0.001\r\n	c4.336,0.691,6.974,6.468,8.221,10.72c0.392,1.328,1.828,2.083,3.109,1.69c1.33-0.394,2.085-1.778,1.69-3.11\r\n	c-1.901-6.392-5.652-13.199-12.24-14.24c-0.003,0-0.006,0-0.01,0c-3.216-0.502-6.481,0.474-9.64,2.836V15.75\r\n	c0-7.637-6.209-13.85-13.841-13.85h-90.4c-1.38,0-2.5,1.12-2.5,2.5s1.12,2.5,2.5,2.5h90.4c4.875,0,8.841,3.97,8.841,8.85v76.749\r\n	c-5.728,7.333-10.151,18.76-12.18,31.571c-2.752,17.409-0.372,33.707,5.913,41.291l-2.348,14.819H171.54c-4.136,0-7.5,3.364-7.5,7.5\r\n	v10.64h-8.01c-4.136,0-7.5,3.364-7.5,7.5v22.19H28.758c2.003-2.439,3.202-5.518,3.202-8.85v0v0v-58c0-1.38-1.12-2.5-2.5-2.5\r\n	c-1.38,0-2.5,1.12-2.5,2.5v34.95H11.794c-4.136,0-7.5,3.364-7.5,7.5v15.188c0,7.717,6.106,14.087,13.611,14.202\r\n	c0.889,0.016,129.735,0.011,130.625,0.011v13.88C148.53,251.026,151.895,254.39,156.03,254.39z M9.294,218.798V203.61\r\n	c0-1.378,1.122-2.5,2.5-2.5h15.163v18.054c0,4.903-4.028,8.914-8.976,8.836C13.191,227.927,9.294,223.799,9.294,218.798z\r\n	 M201.699,117.753c0.262-1.645,1.807-2.778,3.458-2.515c1.694,0.27,2.786,1.879,2.513,3.46c-2.364,14.945-9.083,57.417-9.726,61.481\r\n	h-6.137L201.699,117.753z M169.04,187.68c0-1.378,1.121-2.5,2.5-2.5c3.857,0,32.434,0,36.06,0c1.379,0,2.5,1.122,2.5,2.5v10.64\r\n	h-41.06V187.68z M153.53,205.82c0-1.378,1.121-2.5,2.5-2.5c6.82,0,59.328,0,67.08,0c1.379,0,2.5,1.122,2.5,2.5v41.07\r\n	c0,1.378-1.121,2.5-2.5,2.5h-67.08c-1.379,0-2.5-1.122-2.5-2.5V205.82z",
        fill: "#202020"
      }
    )
  ] });
}

const BrandMarkComponent = ({ colorScheme }) => {
  const style = { fill: colorScheme === "dark" ? "#fff" : "#000" };
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 750 750", width: 50, style, children: [
    /* @__PURE__ */ jsx("title", { children: "Brand mark" }),
    /* @__PURE__ */ jsx("path", { d: "M375,632.82a257.81,257.81,0,1,1,182.31-75.51A256.16,256.16,0,0,1,375,632.82Zm0-475.64c-120.11,0-217.82,97.71-217.82,217.82S254.89,592.82,375,592.82,592.82,495.11,592.82,375,495.11,157.18,375,157.18Z" }),
    /* @__PURE__ */ jsx("path", { d: "M374.85,547.47a48.65,48.65,0,0,1-48.59-48.59V251.12a48.59,48.59,0,1,1,97.18,0V498.88A48.65,48.65,0,0,1,374.85,547.47Zm0-304.94a8.6,8.6,0,0,0-8.59,8.59V498.88a8.59,8.59,0,1,0,17.18,0V251.12A8.6,8.6,0,0,0,374.85,242.53Z" }),
    /* @__PURE__ */ jsx("path", { d: "M273.8,495.11a48.77,48.77,0,0,1-8.32-.71A48.23,48.23,0,0,1,234,474.56h0a48.59,48.59,0,0,1,11.63-67.72L448,263.81a48.59,48.59,0,1,1,56.1,79.35l-202.31,143A48.3,48.3,0,0,1,273.8,495.11ZM476,294.9a8.52,8.52,0,0,0-4.95,1.57l-202.31,143a8.6,8.6,0,0,0-2.06,12h0a8.6,8.6,0,0,0,12,2.06L481,310.5A8.59,8.59,0,0,0,477.46,295,8.41,8.41,0,0,0,476,294.9Z" }),
    /* @__PURE__ */ jsx("path", { d: "M475.91,495.11a48.27,48.27,0,0,1-28-8.92l-202.31-143a48.59,48.59,0,1,1,56.1-79.35l202.31,143a48.59,48.59,0,0,1-19.83,87.56A48.86,48.86,0,0,1,475.91,495.11ZM273.71,294.9a8.45,8.45,0,0,0-1.47.12,8.59,8.59,0,0,0-3.5,15.48l202.31,143a8.59,8.59,0,0,0,12-2.06h0a8.6,8.6,0,0,0-2-12l-202.32-143A8.47,8.47,0,0,0,273.71,294.9Z" })
  ] });
};

const config = config$1({
  storage: {
    kind: "local"
  },
  ui: {
    brand: {
      name: "Your Company",
      mark: BrandMarkComponent
    }
  },
  singletons: {
    header: singleton({
      label: "Navigation",
      path: "src/content/global/header",
      format: { data: "json" },
      schema: {
        logo: index.object({
          imagePath: index.image({
            label: "Logo",
            directory: "src/assets/global",
            publicPath: "/src/assets/global/",
            validation: {
              isRequired: false
            }
          }),
          title: index.text({ label: "Title" })
        }),
        pages: index.array(
          index.object({
            title: index.text({ label: "Title" }),
            link: index.text({ label: "Url" })
          }),
          // Labelling options
          {
            label: "Pages",
            itemLabel: (props) => props.fields.title.value
          }
        ),
        actions: index.array(
          index.object({
            title: index.text({ label: "Title" }),
            link: index.text({ label: "Url" }),
            style: index.select({
              label: "Style",
              options: [
                { label: "Filled", value: "button" },
                { label: "Outlined", value: "outline" }
              ],
              defaultValue: "button"
            })
          }),
          // Labelling options
          {
            label: "Actions",
            itemLabel: (props) => props.fields.title.value
          }
        ),
        contacts: index.object(
          {
            phone: index.text({ label: "Phone" }),
            mail: index.text({ label: "Email" }),
            address: index.text({ label: "Address" })
          },
          {
            label: "Contacts"
          }
        ),
        socials: index.array(
          index.object({
            icon: index.text({ label: "Icon" }),
            link: index.text({ label: "Url" })
          }),
          {
            itemLabel: (props) => props.fields.link.value,
            label: "Social"
          }
        )
      }
    }),
    widget: singleton({
      label: "Whatsapp widget",
      path: "src/content/global/widget",
      format: { data: "json" },
      schema: {
        enabled: index.checkbox({ label: "Abilita" }),
        icon: index.select({
          label: "Icona",
          options: IconList,
          defaultValue: "whatsapp"
        }),
        link: index.url({ label: "Link" })
      }
    }),
    footer: singleton({
      label: "Footer",
      path: "src/content/global/footer",
      format: { data: "json" },
      schema: {
        title: index.text({ label: "Title" }),
        subtitle: index.text({ label: "Subtitle" }),
        copyright: index.text({ label: "Copyright" }),
        contacts: index.object(
          {
            phone: index.text({ label: "Phone" }),
            mail: index.text({ label: "Email" }),
            socials: index.array(
              index.object({
                title: index.text({ label: "Title" }),
                link: index.text({ label: "Url" }),
                icon: index.text({ label: "Icon" })
              }),
              {
                label: "Social",
                itemLabel: (props) => props.fields.title.value ?? "Imposta un titolo"
              }
            )
          },
          {
            label: "Contacts"
          }
        )
      }
    })
  },
  collections: {
    pages: collection({
      label: "Pages",
      slugField: "title",
      path: "src/content/pages/it/*",
      entryLayout: "content",
      columns: ["title", "lastUpdateDate"],
      previewUrl: "/{slug}",
      format: { contentField: "content" },
      schema: {
        title: index.slug({
          name: {
            label: "Title",
            description: "Titolo della pagina",
            validation: {
              isRequired: true
            }
          },
          // Optional slug label overrides
          slug: {
            label: "SEO-friendly slug",
            description: "Slug da usare per la pagina, attenzione, è consigliato non modificarlo dopo la pubblicazione."
          }
        }),
        subtitle: index.text({
          label: "Subtitle",
          multiline: true
        }),
        cover: index.image({
          label: "Cover Image",
          directory: "src/assets/pages",
          publicPath: "@/assets/pages/"
        }),
        type: index.select({
          label: "Tipo pagina",
          options: [
            {
              label: "Informativa",
              value: "informational"
            },
            {
              label: "Servizio",
              value: "service"
            },
            {
              label: "Contatti/supporto",
              value: "support"
            },
            {
              label: "Blog",
              value: "blog"
            },
            {
              label: "Termini e condizioni",
              value: "terms"
            }
          ],
          defaultValue: "informational"
        }),
        lastUpdateDate: index.date({
          label: "Last Update Date",
          description: "Data dell'ultimo aggiornamento della pagina",
          defaultValue: {
            kind: "today"
          },
          validation: {
            isRequired: true
          }
        }),
        hideTitle: index.checkbox({
          label: "Nascondi titolo",
          defaultValue: false
        }),
        addPadding: index.checkbox({
          label: "Aggiungi padding",
          defaultValue: true
        }),
        seo: index.object(
          {
            title: index.text({
              label: "Titolo SEO",
              validation: {
                isRequired: true,
                length: {
                  // min: 10,
                }
              }
            }),
            description: index.text({
              label: "Descrizione SEO",
              multiline: true,
              validation: {
                isRequired: true,
                length: {
                  // min: 50,
                }
              }
            }),
            author: index.relationship({
              label: "Author",
              description: "Autore della pagina",
              collection: "authors",
              validation: {
                isRequired: true
              }
            })
          },
          {
            label: "SEO",
            description: "Opzioni SEO per la pagina"
          }
        ),
        content: index.markdoc({
          label: "Content",
          options: {
            heading: [2, 3, 4, 5, 6],
            image: {
              directory: "src/assets/pages",
              publicPath: "/src/assets/pages/"
            }
          },
          components: {
            Container: wrapper({
              label: "Contenitore",
              icon: ContainerIcon({ ariaHidden: true }),
              description: "Contenitore che ti consente di agiungere del margine a destra e sinistra",
              schema: {
                class: index.text({
                  label: "Classi custom"
                })
              }
            }),
            ContainerFluid: wrapper({
              label: "Contenitore largo",
              icon: ContainerFluidIcon({ ariaHidden: true }),
              description: "Contenitore che ti consente di avere del margine a destra e sinistra",
              schema: {
                class: index.text({
                  label: "Classi custom"
                })
              }
            }),
            Prose: wrapper({
              label: "Prosa",
              icon: ProseIcon({ ariaHidden: true }),
              description: "Contenitore di testo, ideale per blog o per contenuti informativi",
              schema: {
                class: index.text({
                  label: "Classi custom"
                })
              }
            }),
            Flex: wrapper({
              label: "Flexbox",
              icon: FlexboxIcon({ ariaHidden: true }),
              description: "Contenitore flessibile",
              schema: {
                class: index.text({
                  label: "Classi custom",
                  description: "Aggiungi classi personalizzate al contenitore"
                }),
                direction: index.select({
                  label: "Direzione",
                  description: "Scegli la direzione del contenitore",
                  options: [
                    { label: "Da sinistra a destra", value: "ltr" },
                    { label: "Da destra a sinistra", value: "rtl" },
                    { label: "Dall'alto in basso", value: "ttb" },
                    { label: "Dal basso in alto", value: "btt" }
                  ],
                  defaultValue: "ltr"
                }),
                verticalAlign: index.select({
                  label: "Allineamento verticale",
                  description: "Scegli l'allineamento verticale del contenitore",
                  options: [
                    { label: "In alto", value: "top" },
                    { label: "Al centro", value: "middle" },
                    { label: "In basso", value: "bottom" },
                    { label: "Espandi", value: "stretch" },
                    { label: "Spaziato", value: "spaceBetween" },
                    { label: "Spaziato intorno", value: "spaceAround" }
                  ],
                  defaultValue: "top"
                }),
                horizontalAlign: index.select({
                  label: "Allineamento orizzontale",
                  description: "Scegli l'allineamento orizzontale del contenitore",
                  options: [
                    { label: "A sinistra", value: "left" },
                    { label: "Al centro", value: "center" },
                    { label: "A destra", value: "right" },
                    { label: "Spaziato", value: "spaceBetween" },
                    { label: "Spaziato intorno", value: "spaceAround" },
                    { label: "Spaziato uniformemente", value: "spaceEvenly" }
                  ],
                  defaultValue: "left"
                }),
                itemsAlignment: index.select({
                  label: "Allineamento oggetti",
                  description: "Scegli l'allineamento degli oggetti all'interno del contenitore",
                  options: [
                    { label: "All'inizio", value: "start" },
                    { label: "Al centro", value: "center" },
                    { label: "Alla fine", value: "end" },
                    { label: "Espandi", value: "stretch" },
                    { label: "Alla base del testo", value: "baseline" }
                  ],
                  defaultValue: "start"
                }),
                gap: index.number({
                  label: "Spaziatura",
                  description: "Scegli lo spazio tra gli oggetti",
                  defaultValue: 0
                }),
                wrap: index.checkbox({
                  label: "Vai a capo",
                  description: "Scegli se andare a capo o meno quando non c'è più spazio nel contenitore",
                  defaultValue: false
                })
              }
            }),
            Hero: block({
              label: "Hero",
              description: "Sezione hero dell'homepage",
              icon: HeroIcon({ ariaHidden: true }),
              schema: {
                title: index.text({
                  label: "Title",
                  validation: {
                    isRequired: true
                  }
                }),
                subtitle: index.text({
                  label: "Subtitle",
                  validation: {
                    isRequired: true
                  }
                }),
                buttons: index.array(
                  index.object({
                    title: index.text({ label: "Title" }),
                    href: index.text({ label: "Url" }),
                    style: index.select({
                      label: "Style",
                      options: [
                        { label: "Filled", value: "button" },
                        { label: "Outlined", value: "outline" }
                      ],
                      defaultValue: "button"
                    }),
                    icon: index.text({ label: "Icona" })
                  }),
                  // Labelling options
                  {
                    label: "Actions",
                    itemLabel: (props) => props.fields.title.value
                  }
                )
              }
            }),
            LogoCloud: block({
              label: "LogoCloud",
              description: "LogoCloud",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {
                title: index.text({
                  label: "Title",
                  validation: {
                    isRequired: true
                  }
                }),
                logos: index.array(
                  index.image({
                    label: "Logo",
                    directory: "src/assets/pages",
                    publicPath: "/src/assets/pages/"
                  }),
                  {
                    label: "Loghi"
                  }
                )
              }
            }),
            Services: block({
              label: "Services",
              description: "Services",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {
                title: index.text({
                  label: "Title",
                  validation: {
                    isRequired: true
                  }
                }),
                services: index.array(
                  index.object({
                    title: index.text({ label: "Title" }),
                    description: index.text({ label: "Description", multiline: true }),
                    icon: index.image({
                      label: "Icona",
                      directory: "src/assets/pages",
                      publicPath: "/src/assets/pages/"
                    })
                  }),
                  // Labelling options
                  {
                    label: "Servizi",
                    itemLabel: (props) => props.fields.title.value
                  }
                )
              }
            }),
            VideoEffect: block({
              label: "VideoEffect",
              description: "VideoEffect",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {}
            }),
            RecentWork: block({
              label: "RecentWork",
              description: "RecentWork",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {
                title: index.text({
                  label: "Title",
                  validation: {
                    isRequired: true
                  }
                }),
                buttons: index.array(
                  index.object({
                    title: index.text({ label: "Title" }),
                    href: index.text({ label: "Url" }),
                    style: index.select({
                      label: "Style",
                      options: [
                        { label: "Filled", value: "button" },
                        { label: "Outlined", value: "outline" }
                      ],
                      defaultValue: "button"
                    }),
                    icon: index.text({ label: "Icona" })
                  }),
                  // Labelling options
                  {
                    label: "Actions",
                    itemLabel: (props) => props.fields.title.value
                  }
                )
              }
            }),
            Testimonial: block({
              label: "Testimonial",
              description: "Testimonial",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {
                testimonial: index.text({
                  label: "Testimonial",
                  multiline: true,
                  validation: {
                    isRequired: true
                  }
                }),
                name: index.text({
                  label: "Name",
                  validation: {
                    isRequired: true
                  }
                })
              }
            }),
            Results: block({
              label: "Results",
              description: "Results",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {
                title: index.text({
                  label: "Title",
                  validation: {
                    isRequired: true
                  }
                }),
                results: index.array(
                  index.object({
                    label: index.text({ label: "Label" }),
                    value: index.text({ label: "Value" })
                  }),
                  // Labelling options
                  {
                    label: "Risultati",
                    itemLabel: (props) => props.fields.label.value
                  }
                )
              }
            }),
            BlogLatest: block({
              label: "BlogLatest",
              description: "BlogLatest",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {
                title: index.text({
                  label: "Title",
                  validation: {
                    isRequired: true
                  }
                })
              }
            }),
            About: block({
              label: "About",
              description: "About section",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {
                title: index.text({
                  label: "Title",
                  validation: {
                    isRequired: true
                  }
                }),
                subtitle: index.text({
                  label: "Subtitle",
                  validation: {
                    isRequired: true
                  }
                }),
                content: index.text({
                  label: "Content",
                  multiline: true,
                  validation: {
                    isRequired: true
                  }
                })
              }
            }),
            Works: block({
              label: "Works",
              description: "Works section",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {}
            }),
            News: block({
              label: "News",
              description: "News section",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {}
            }),
            Contact: block({
              label: "Contact",
              description: "Contact form section",
              icon: ContactIcon({ ariaHidden: true }),
              schema: {
                title: index.text({
                  label: "Title",
                  validation: {
                    isRequired: true
                  }
                }),
                fields: index.array(
                  index.object({
                    label: index.text({ label: "Label" }),
                    placeholder: index.text({ label: "Placeholder" }),
                    width: index.number({ label: "Width" }),
                    type: index.select({
                      label: "Type",
                      options: [
                        { label: "Text", value: "text" },
                        { label: "Email", value: "email" },
                        { label: "Textarea", value: "textarea" }
                      ],
                      defaultValue: "text"
                    }),
                    required: index.checkbox({ label: "Required" })
                  }),
                  {
                    label: "Fields",
                    itemLabel: (props) => props.fields.label.value
                  }
                )
              }
            })
          }
        })
      }
    }),
    posts: collection({
      label: "Posts",
      slugField: "title",
      path: "src/content/posts/it/*",
      entryLayout: "content",
      columns: ["title", "lastUpdateDate"],
      previewUrl: "/post/{slug}",
      format: { contentField: "content" },
      schema: {
        title: index.slug({
          name: {
            label: "Title",
            description: "Titolo del post",
            validation: {
              isRequired: true
            }
          },
          // Optional slug label overrides
          slug: {
            label: "SEO-friendly slug",
            description: "Slug da usare per il post, attenzione, è consigliato non modificarlo dopo la pubblicazione."
          }
        }),
        description: index.text({
          label: "Description",
          multiline: true,
          validation: {
            isRequired: true
          }
        }),
        author: index.relationship({
          label: "Author",
          description: "Autore dell'articolo",
          collection: "authors",
          validation: {
            isRequired: true
          }
        }),
        cover: index.image({
          label: "Cover Image",
          directory: "src/assets/posts",
          publicPath: "@/assets/posts/"
        }),
        tags: index.array(index.text({ label: "Tag" }), {
          label: "Tag",
          itemLabel: (props) => props.value
        }),
        pubDate: index.date({
          label: "Publication Date",
          description: "Data di pubblicazione dell'articolo",
          defaultValue: {
            kind: "today"
          },
          validation: {
            isRequired: true
          }
        }),
        lastUpdateDate: index.date({
          label: "Last Update Date",
          description: "Data dell'ultimo aggiornamento dell'articolo'",
          defaultValue: {
            kind: "today"
          },
          validation: {
            isRequired: true
          }
        }),
        hidden: index.checkbox({
          label: "Hidden"
        }),
        content: index.markdoc({
          label: "Content",
          options: {
            heading: [2, 3, 4, 5, 6],
            image: {
              directory: "src/assets/posts",
              publicPath: "/src/assets/posts/"
            }
          },
          components: {}
        })
      }
    }),
    works: collection({
      label: "Works",
      slugField: "title",
      path: "src/content/works/it/*",
      entryLayout: "content",
      columns: ["title", "lastUpdateDate"],
      previewUrl: "/works/{slug}",
      format: { contentField: "content" },
      schema: {
        title: index.slug({
          name: {
            label: "Title",
            description: "Titolo del post",
            validation: {
              isRequired: true
            }
          },
          // Optional slug label overrides
          slug: {
            label: "SEO-friendly slug",
            description: "Slug da usare per il post, attenzione, è consigliato non modificarlo dopo la pubblicazione."
          }
        }),
        link: index.text({
          label: "Link",
          validation: {
            isRequired: true
          }
        }),
        description: index.text({
          label: "Description",
          multiline: true,
          validation: {
            isRequired: true
          }
        }),
        tags: index.array(index.text({ label: "Tag" }), {
          label: "Tag",
          itemLabel: (props) => props.value
        }),
        cover: index.image({
          label: "Cover Image",
          directory: "src/assets/works",
          publicPath: "@/assets/works/"
        }),
        pubDate: index.date({
          label: "Publication Date",
          description: "Data di pubblicazione dell'articolo",
          defaultValue: {
            kind: "today"
          },
          validation: {
            isRequired: true
          }
        }),
        lastUpdateDate: index.date({
          label: "Last Update Date",
          description: "Data dell'ultimo aggiornamento dell'articolo'",
          defaultValue: {
            kind: "today"
          },
          validation: {
            isRequired: true
          }
        }),
        content: index.markdoc({
          label: "Content",
          options: {
            heading: [2, 3, 4, 5, 6],
            image: {
              directory: "src/assets/posts",
              publicPath: "/src/assets/posts/"
            }
          },
          components: {}
        })
      }
    }),
    authors: collection({
      label: "Authors",
      slugField: "name",
      path: "src/content/authors/*",
      columns: ["name"],
      previewUrl: "/author/{slug}",
      format: { contentField: "content" },
      schema: {
        name: index.slug({
          name: {
            label: "Name",
            description: "Author's full name",
            validation: {
              isRequired: true
            }
          },
          // Optional slug label overrides
          slug: {
            label: "SEO-friendly slug",
            description: "This will define the file/folder name for this entry"
          }
        }),
        avatar: index.image({
          label: "Immagine di profilo",
          directory: "src/assets/authors",
          publicPath: "@/assets/authors/"
        }),
        content: index.document({
          label: "Content",
          formatting: true,
          dividers: true,
          links: true,
          images: {
            directory: "src/assets/authors",
            publicPath: "/src/assets/authors/"
          }
        })
      }
    })
  }
});

const all = makeHandler({ config });
const ALL = all;

const prerender = false;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  ALL,
  all,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
