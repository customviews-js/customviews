/*!
 * @customviews-js/customviews v1.6.0
 * (c) 2026 Chan Ger Teck
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.CustomViews = {}));
})(this, (function (exports) { 'use strict';

	const EACH_ITEM_REACTIVE = 1;
	const EACH_INDEX_REACTIVE = 1 << 1;
	/** See EachBlock interface metadata.is_controlled for an explanation what this is */
	const EACH_IS_CONTROLLED = 1 << 2;
	const EACH_IS_ANIMATED = 1 << 3;
	const EACH_ITEM_IMMUTABLE = 1 << 4;

	const PROPS_IS_IMMUTABLE = 1;
	const PROPS_IS_RUNES = 1 << 1;
	const PROPS_IS_UPDATED = 1 << 2;
	const PROPS_IS_BINDABLE = 1 << 3;
	const PROPS_IS_LAZY_INITIAL = 1 << 4;

	const TRANSITION_IN = 1;
	const TRANSITION_OUT = 1 << 1;
	const TRANSITION_GLOBAL = 1 << 2;

	const TEMPLATE_FRAGMENT = 1;
	const TEMPLATE_USE_IMPORT_NODE = 1 << 1;

	const HYDRATION_START = '[';
	/** used to indicate that an `{:else}...` block was rendered */
	const HYDRATION_START_ELSE = '[!';
	const HYDRATION_END = ']';
	const HYDRATION_ERROR = {};

	const UNINITIALIZED = Symbol();

	const NAMESPACE_HTML = 'http://www.w3.org/1999/xhtml';

	var DEV = false;

	// Store the references to globals in case someone tries to monkey patch these, causing the below
	// to de-opt (this occurs often when using popular extensions).
	var is_array = Array.isArray;
	var index_of = Array.prototype.indexOf;
	var array_from = Array.from;
	var object_keys = Object.keys;
	var define_property = Object.defineProperty;
	var get_descriptor = Object.getOwnPropertyDescriptor;
	var get_descriptors = Object.getOwnPropertyDescriptors;
	var object_prototype = Object.prototype;
	var array_prototype = Array.prototype;
	var get_prototype_of = Object.getPrototypeOf;
	var is_extensible = Object.isExtensible;

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	const noop = () => {};

	/** @param {Function} fn */
	function run(fn) {
		return fn();
	}

	/** @param {Array<() => void>} arr */
	function run_all(arr) {
		for (var i = 0; i < arr.length; i++) {
			arr[i]();
		}
	}

	/**
	 * TODO replace with Promise.withResolvers once supported widely enough
	 * @template [T=void]
	 */
	function deferred() {
		/** @type {(value: T) => void} */
		var resolve;

		/** @type {(reason: any) => void} */
		var reject;

		/** @type {Promise<T>} */
		var promise = new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		});

		// @ts-expect-error
		return { promise, resolve, reject };
	}

	// General flags
	const DERIVED = 1 << 1;
	const EFFECT = 1 << 2;
	const RENDER_EFFECT = 1 << 3;
	/**
	 * An effect that does not destroy its child effects when it reruns.
	 * Runs as part of render effects, i.e. not eagerly as part of tree traversal or effect flushing.
	 */
	const MANAGED_EFFECT = 1 << 24;
	/**
	 * An effect that does not destroy its child effects when it reruns (like MANAGED_EFFECT).
	 * Runs eagerly as part of tree traversal or effect flushing.
	 */
	const BLOCK_EFFECT = 1 << 4;
	const BRANCH_EFFECT = 1 << 5;
	const ROOT_EFFECT = 1 << 6;
	const BOUNDARY_EFFECT = 1 << 7;
	/**
	 * Indicates that a reaction is connected to an effect root — either it is an effect,
	 * or it is a derived that is depended on by at least one effect. If a derived has
	 * no dependents, we can disconnect it from the graph, allowing it to either be
	 * GC'd or reconnected later if an effect comes to depend on it again
	 */
	const CONNECTED = 1 << 9;
	const CLEAN = 1 << 10;
	const DIRTY = 1 << 11;
	const MAYBE_DIRTY = 1 << 12;
	const INERT = 1 << 13;
	const DESTROYED = 1 << 14;

	// Flags exclusive to effects
	/** Set once an effect that should run synchronously has run */
	const EFFECT_RAN = 1 << 15;
	/**
	 * 'Transparent' effects do not create a transition boundary.
	 * This is on a block effect 99% of the time but may also be on a branch effect if its parent block effect was pruned
	 */
	const EFFECT_TRANSPARENT = 1 << 16;
	const EAGER_EFFECT = 1 << 17;
	const HEAD_EFFECT = 1 << 18;
	const EFFECT_PRESERVED = 1 << 19;
	const USER_EFFECT = 1 << 20;
	const EFFECT_OFFSCREEN = 1 << 25;

	// Flags exclusive to deriveds
	/**
	 * Tells that we marked this derived and its reactions as visited during the "mark as (maybe) dirty"-phase.
	 * Will be lifted during execution of the derived and during checking its dirty state (both are necessary
	 * because a derived might be checked but not executed).
	 */
	const WAS_MARKED = 1 << 15;

	// Flags used for async
	const REACTION_IS_UPDATING = 1 << 21;
	const ASYNC = 1 << 22;

	const ERROR_VALUE = 1 << 23;

	const STATE_SYMBOL = Symbol('$state');
	const LEGACY_PROPS = Symbol('legacy props');
	const LOADING_ATTR_SYMBOL = Symbol('');

	/** allow users to ignore aborted signal errors if `reason.name === 'StaleReactionError` */
	const STALE_REACTION = new (class StaleReactionError extends Error {
		name = 'StaleReactionError';
		message = 'The reaction that called `getAbortSignal()` was re-run or destroyed';
	})();
	const TEXT_NODE = 3;
	const COMMENT_NODE = 8;

	/* This file is generated by scripts/process-messages/index.js. Do not edit! */


	/**
	 * `%name%(...)` can only be used during component initialisation
	 * @param {string} name
	 * @returns {never}
	 */
	function lifecycle_outside_component(name) {
		{
			throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
		}
	}

	/* This file is generated by scripts/process-messages/index.js. Do not edit! */


	/**
	 * Cannot create a `$derived(...)` with an `await` expression outside of an effect tree
	 * @returns {never}
	 */
	function async_derived_orphan() {
		{
			throw new Error(`https://svelte.dev/e/async_derived_orphan`);
		}
	}

	/**
	 * `%rune%` cannot be used inside an effect cleanup function
	 * @param {string} rune
	 * @returns {never}
	 */
	function effect_in_teardown(rune) {
		{
			throw new Error(`https://svelte.dev/e/effect_in_teardown`);
		}
	}

	/**
	 * Effect cannot be created inside a `$derived` value that was not itself created inside an effect
	 * @returns {never}
	 */
	function effect_in_unowned_derived() {
		{
			throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
		}
	}

	/**
	 * `%rune%` can only be used inside an effect (e.g. during component initialisation)
	 * @param {string} rune
	 * @returns {never}
	 */
	function effect_orphan(rune) {
		{
			throw new Error(`https://svelte.dev/e/effect_orphan`);
		}
	}

	/**
	 * Maximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state
	 * @returns {never}
	 */
	function effect_update_depth_exceeded() {
		{
			throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
		}
	}

	/**
	 * Failed to hydrate the application
	 * @returns {never}
	 */
	function hydration_failed() {
		{
			throw new Error(`https://svelte.dev/e/hydration_failed`);
		}
	}

	/**
	 * Cannot do `bind:%key%={undefined}` when `%key%` has a fallback value
	 * @param {string} key
	 * @returns {never}
	 */
	function props_invalid_value(key) {
		{
			throw new Error(`https://svelte.dev/e/props_invalid_value`);
		}
	}

	/**
	 * Property descriptors defined on `$state` objects must contain `value` and always be `enumerable`, `configurable` and `writable`.
	 * @returns {never}
	 */
	function state_descriptors_fixed() {
		{
			throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
		}
	}

	/**
	 * Cannot set prototype of `$state` object
	 * @returns {never}
	 */
	function state_prototype_fixed() {
		{
			throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
		}
	}

	/**
	 * Updating state inside `$derived(...)`, `$inspect(...)` or a template expression is forbidden. If the value should not be reactive, declare it without `$state`
	 * @returns {never}
	 */
	function state_unsafe_mutation() {
		{
			throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
		}
	}

	/**
	 * A `<svelte:boundary>` `reset` function cannot be called while an error is still being handled
	 * @returns {never}
	 */
	function svelte_boundary_reset_onerror() {
		{
			throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
		}
	}

	/* This file is generated by scripts/process-messages/index.js. Do not edit! */


	/**
	 * Hydration failed because the initial UI does not match what was rendered on the server. The error occurred near %location%
	 * @param {string | undefined | null} [location]
	 */
	function hydration_mismatch(location) {
		{
			console.warn(`https://svelte.dev/e/hydration_mismatch`);
		}
	}

	/**
	 * The `value` property of a `<select multiple>` element should be an array, but it received a non-array value. The selection will be kept as is.
	 */
	function select_multiple_invalid_value() {
		{
			console.warn(`https://svelte.dev/e/select_multiple_invalid_value`);
		}
	}

	/**
	 * A `<svelte:boundary>` `reset` function only resets the boundary the first time it is called
	 */
	function svelte_boundary_reset_noop() {
		{
			console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
		}
	}

	/** @import { TemplateNode } from '#client' */


	/**
	 * Use this variable to guard everything related to hydration code so it can be treeshaken out
	 * if the user doesn't use the `hydrate` method and these code paths are therefore not needed.
	 */
	let hydrating = false;

	/** @param {boolean} value */
	function set_hydrating(value) {
		hydrating = value;
	}

	/**
	 * The node that is currently being hydrated. This starts out as the first node inside the opening
	 * <!--[--> comment, and updates each time a component calls `$.child(...)` or `$.sibling(...)`.
	 * When entering a block (e.g. `{#if ...}`), `hydrate_node` is the block opening comment; by the
	 * time we leave the block it is the closing comment, which serves as the block's anchor.
	 * @type {TemplateNode}
	 */
	let hydrate_node;

	/** @param {TemplateNode | null} node */
	function set_hydrate_node(node) {
		if (node === null) {
			hydration_mismatch();
			throw HYDRATION_ERROR;
		}

		return (hydrate_node = node);
	}

	function hydrate_next() {
		return set_hydrate_node(get_next_sibling(hydrate_node));
	}

	/** @param {TemplateNode} node */
	function reset(node) {
		if (!hydrating) return;

		// If the node has remaining siblings, something has gone wrong
		if (get_next_sibling(hydrate_node) !== null) {
			hydration_mismatch();
			throw HYDRATION_ERROR;
		}

		hydrate_node = node;
	}

	function next(count = 1) {
		if (hydrating) {
			var i = count;
			var node = hydrate_node;

			while (i--) {
				node = /** @type {TemplateNode} */ (get_next_sibling(node));
			}

			hydrate_node = node;
		}
	}

	/**
	 * Skips or removes (depending on {@link remove}) all nodes starting at `hydrate_node` up until the next hydration end comment
	 * @param {boolean} remove
	 */
	function skip_nodes(remove = true) {
		var depth = 0;
		var node = hydrate_node;

		while (true) {
			if (node.nodeType === COMMENT_NODE) {
				var data = /** @type {Comment} */ (node).data;

				if (data === HYDRATION_END) {
					if (depth === 0) return node;
					depth -= 1;
				} else if (data === HYDRATION_START || data === HYDRATION_START_ELSE) {
					depth += 1;
				}
			}

			var next = /** @type {TemplateNode} */ (get_next_sibling(node));
			if (remove) node.remove();
			node = next;
		}
	}

	/**
	 *
	 * @param {TemplateNode} node
	 */
	function read_hydration_instruction(node) {
		if (!node || node.nodeType !== COMMENT_NODE) {
			hydration_mismatch();
			throw HYDRATION_ERROR;
		}

		return /** @type {Comment} */ (node).data;
	}

	/** @import { Equals } from '#client' */

	/** @type {Equals} */
	function equals(value) {
		return value === this.v;
	}

	/**
	 * @param {unknown} a
	 * @param {unknown} b
	 * @returns {boolean}
	 */
	function safe_not_equal(a, b) {
		return a != a
			? b == b
			: a !== b || (a !== null && typeof a === 'object') || typeof a === 'function';
	}

	/** @type {Equals} */
	function safe_equals(value) {
		return !safe_not_equal(value, this.v);
	}

	/** True if experimental.async=true */
	/** True if we're not certain that we only have Svelte 5 code in the compilation */
	let legacy_mode_flag = false;
	/** True if $inspect.trace is used */
	let tracing_mode_flag = false;

	function enable_legacy_mode_flag() {
		legacy_mode_flag = true;
	}

	/** @import { ComponentContext, DevStackEntry, Effect } from '#client' */

	/** @type {ComponentContext | null} */
	let component_context = null;

	/** @param {ComponentContext | null} context */
	function set_component_context(context) {
		component_context = context;
	}

	/**
	 * @param {Record<string, unknown>} props
	 * @param {any} runes
	 * @param {Function} [fn]
	 * @returns {void}
	 */
	function push(props, runes = false, fn) {
		component_context = {
			p: component_context,
			i: false,
			c: null,
			e: null,
			s: props,
			x: null,
			l: legacy_mode_flag && !runes ? { s: null, u: null, $: [] } : null
		};
	}

	/**
	 * @template {Record<string, any>} T
	 * @param {T} [component]
	 * @returns {T}
	 */
	function pop(component) {
		var context = /** @type {ComponentContext} */ (component_context);
		var effects = context.e;

		if (effects !== null) {
			context.e = null;

			for (var fn of effects) {
				create_user_effect(fn);
			}
		}

		if (component !== undefined) {
			context.x = component;
		}

		context.i = true;

		component_context = context.p;

		return component ?? /** @type {T} */ ({});
	}

	/** @returns {boolean} */
	function is_runes() {
		return !legacy_mode_flag || (component_context !== null && component_context.l === null);
	}

	/** @type {Array<() => void>} */
	let micro_tasks = [];

	function run_micro_tasks() {
		var tasks = micro_tasks;
		micro_tasks = [];
		run_all(tasks);
	}

	/**
	 * @param {() => void} fn
	 */
	function queue_micro_task(fn) {
		if (micro_tasks.length === 0 && !is_flushing_sync) {
			var tasks = micro_tasks;
			queueMicrotask(() => {
				// If this is false, a flushSync happened in the meantime. Do _not_ run new scheduled microtasks in that case
				// as the ordering of microtasks would be broken at that point - consider this case:
				// - queue_micro_task schedules microtask A to flush task X
				// - synchronously after, flushSync runs, processing task X
				// - synchronously after, some other microtask B is scheduled, but not through queue_micro_task but for example a Promise.resolve() in user code
				// - synchronously after, queue_micro_task schedules microtask C to flush task Y
				// - one tick later, microtask A now resolves, flushing task Y before microtask B, which is incorrect
				// This if check prevents that race condition (that realistically will only happen in tests)
				if (tasks === micro_tasks) run_micro_tasks();
			});
		}

		micro_tasks.push(fn);
	}

	/**
	 * Synchronously run any queued tasks.
	 */
	function flush_tasks() {
		while (micro_tasks.length > 0) {
			run_micro_tasks();
		}
	}

	/** @import { Derived, Effect } from '#client' */
	/** @import { Boundary } from './dom/blocks/boundary.js' */

	/**
	 * @param {unknown} error
	 */
	function handle_error(error) {
		var effect = active_effect;

		// for unowned deriveds, don't throw until we read the value
		if (effect === null) {
			/** @type {Derived} */ (active_reaction).f |= ERROR_VALUE;
			return error;
		}

		if ((effect.f & EFFECT_RAN) === 0) {
			// if the error occurred while creating this subtree, we let it
			// bubble up until it hits a boundary that can handle it
			if ((effect.f & BOUNDARY_EFFECT) === 0) {

				throw error;
			}

			/** @type {Boundary} */ (effect.b).error(error);
		} else {
			// otherwise we bubble up the effect tree ourselves
			invoke_error_boundary(error, effect);
		}
	}

	/**
	 * @param {unknown} error
	 * @param {Effect | null} effect
	 */
	function invoke_error_boundary(error, effect) {
		while (effect !== null) {
			if ((effect.f & BOUNDARY_EFFECT) !== 0) {
				try {
					/** @type {Boundary} */ (effect.b).error(error);
					return;
				} catch (e) {
					error = e;
				}
			}

			effect = effect.parent;
		}

		throw error;
	}

	/** @import { Fork } from 'svelte' */
	/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */

	/**
	 * @typedef {{
	 *   parent: EffectTarget | null;
	 *   effect: Effect | null;
	 *   effects: Effect[];
	 *   render_effects: Effect[];
	 * }} EffectTarget
	 */

	/** @type {Set<Batch>} */
	const batches = new Set();

	/** @type {Batch | null} */
	let current_batch = null;

	/**
	 * When time travelling (i.e. working in one batch, while other batches
	 * still have ongoing work), we ignore the real values of affected
	 * signals in favour of their values within the batch
	 * @type {Map<Value, any> | null}
	 */
	let batch_values = null;

	// TODO this should really be a property of `batch`
	/** @type {Effect[]} */
	let queued_root_effects = [];

	/** @type {Effect | null} */
	let last_scheduled_effect = null;

	let is_flushing = false;
	let is_flushing_sync = false;

	class Batch {
		committed = false;

		/**
		 * The current values of any sources that are updated in this batch
		 * They keys of this map are identical to `this.#previous`
		 * @type {Map<Source, any>}
		 */
		current = new Map();

		/**
		 * The values of any sources that are updated in this batch _before_ those updates took place.
		 * They keys of this map are identical to `this.#current`
		 * @type {Map<Source, any>}
		 */
		previous = new Map();

		/**
		 * When the batch is committed (and the DOM is updated), we need to remove old branches
		 * and append new ones by calling the functions added inside (if/each/key/etc) blocks
		 * @type {Set<() => void>}
		 */
		#commit_callbacks = new Set();

		/**
		 * If a fork is discarded, we need to destroy any effects that are no longer needed
		 * @type {Set<(batch: Batch) => void>}
		 */
		#discard_callbacks = new Set();

		/**
		 * The number of async effects that are currently in flight
		 */
		#pending = 0;

		/**
		 * The number of async effects that are currently in flight, _not_ inside a pending boundary
		 */
		#blocking_pending = 0;

		/**
		 * A deferred that resolves when the batch is committed, used with `settled()`
		 * TODO replace with Promise.withResolvers once supported widely enough
		 * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
		 */
		#deferred = null;

		/**
		 * Deferred effects (which run after async work has completed) that are DIRTY
		 * @type {Set<Effect>}
		 */
		#dirty_effects = new Set();

		/**
		 * Deferred effects that are MAYBE_DIRTY
		 * @type {Set<Effect>}
		 */
		#maybe_dirty_effects = new Set();

		/**
		 * A set of branches that still exist, but will be destroyed when this batch
		 * is committed — we skip over these during `process`
		 * @type {Set<Effect>}
		 */
		skipped_effects = new Set();

		is_fork = false;

		is_deferred() {
			return this.is_fork || this.#blocking_pending > 0;
		}

		/**
		 *
		 * @param {Effect[]} root_effects
		 */
		process(root_effects) {
			queued_root_effects = [];

			this.apply();

			/** @type {EffectTarget} */
			var target = {
				parent: null,
				effect: null,
				effects: [],
				render_effects: []
			};

			for (const root of root_effects) {
				this.#traverse_effect_tree(root, target);
				// Note: #traverse_effect_tree runs block effects eagerly, which can schedule effects,
				// which means queued_root_effects now may be filled again.

				// Helpful for debugging reactivity loss that has to do with branches being skipped:
				// log_inconsistent_branches(root);
			}

			if (!this.is_fork) {
				this.#resolve();
			}

			if (this.is_deferred()) {
				this.#defer_effects(target.effects);
				this.#defer_effects(target.render_effects);
			} else {
				current_batch = null;

				flush_queued_effects(target.render_effects);
				flush_queued_effects(target.effects);

				this.#deferred?.resolve();
			}

			batch_values = null;
		}

		/**
		 * Traverse the effect tree, executing effects or stashing
		 * them for later execution as appropriate
		 * @param {Effect} root
		 * @param {EffectTarget} target
		 */
		#traverse_effect_tree(root, target) {
			root.f ^= CLEAN;

			var effect = root.first;

			while (effect !== null) {
				var flags = effect.f;
				var is_branch = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
				var is_skippable_branch = is_branch && (flags & CLEAN) !== 0;

				var skip = is_skippable_branch || (flags & INERT) !== 0 || this.skipped_effects.has(effect);

				if ((effect.f & BOUNDARY_EFFECT) !== 0 && effect.b?.is_pending()) {
					target = {
						parent: target,
						effect,
						effects: [],
						render_effects: []
					};
				}

				if (!skip && effect.fn !== null) {
					if (is_branch) {
						effect.f ^= CLEAN;
					} else if ((flags & EFFECT) !== 0) {
						target.effects.push(effect);
					} else if (is_dirty(effect)) {
						if ((effect.f & BLOCK_EFFECT) !== 0) this.#dirty_effects.add(effect);
						update_effect(effect);
					}

					var child = effect.first;

					if (child !== null) {
						effect = child;
						continue;
					}
				}

				var parent = effect.parent;
				effect = effect.next;

				while (effect === null && parent !== null) {
					if (parent === target.effect) {
						// TODO rather than traversing into pending boundaries and deferring the effects,
						// could we just attach the effects _to_ the pending boundary and schedule them
						// once the boundary is ready?
						this.#defer_effects(target.effects);
						this.#defer_effects(target.render_effects);

						target = /** @type {EffectTarget} */ (target.parent);
					}

					effect = parent.next;
					parent = parent.parent;
				}
			}
		}

		/**
		 * @param {Effect[]} effects
		 */
		#defer_effects(effects) {
			for (const e of effects) {
				if ((e.f & DIRTY) !== 0) {
					this.#dirty_effects.add(e);
				} else if ((e.f & MAYBE_DIRTY) !== 0) {
					this.#maybe_dirty_effects.add(e);
				}

				// Since we're not executing these effects now, we need to clear any WAS_MARKED flags
				// so that other batches can correctly reach these effects during their own traversal
				this.#clear_marked(e.deps);

				// mark as clean so they get scheduled if they depend on pending async state
				set_signal_status(e, CLEAN);
			}
		}

		/**
		 * @param {Value[] | null} deps
		 */
		#clear_marked(deps) {
			if (deps === null) return;

			for (const dep of deps) {
				if ((dep.f & DERIVED) === 0 || (dep.f & WAS_MARKED) === 0) {
					continue;
				}

				dep.f ^= WAS_MARKED;

				this.#clear_marked(/** @type {Derived} */ (dep).deps);
			}
		}

		/**
		 * Associate a change to a given source with the current
		 * batch, noting its previous and current values
		 * @param {Source} source
		 * @param {any} value
		 */
		capture(source, value) {
			if (!this.previous.has(source)) {
				this.previous.set(source, value);
			}

			// Don't save errors in `batch_values`, or they won't be thrown in `runtime.js#get`
			if ((source.f & ERROR_VALUE) === 0) {
				this.current.set(source, source.v);
				batch_values?.set(source, source.v);
			}
		}

		activate() {
			current_batch = this;
			this.apply();
		}

		deactivate() {
			// If we're not the current batch, don't deactivate,
			// else we could create zombie batches that are never flushed
			if (current_batch !== this) return;

			current_batch = null;
			batch_values = null;
		}

		flush() {
			this.activate();

			if (queued_root_effects.length > 0) {
				flush_effects();

				if (current_batch !== null && current_batch !== this) {
					// this can happen if a new batch was created during `flush_effects()`
					return;
				}
			} else if (this.#pending === 0) {
				this.process([]); // TODO this feels awkward
			}

			this.deactivate();
		}

		discard() {
			for (const fn of this.#discard_callbacks) fn(this);
			this.#discard_callbacks.clear();
		}

		#resolve() {
			if (this.#blocking_pending === 0) {
				// append/remove branches
				for (const fn of this.#commit_callbacks) fn();
				this.#commit_callbacks.clear();
			}

			if (this.#pending === 0) {
				this.#commit();
			}
		}

		#commit() {
			// If there are other pending batches, they now need to be 'rebased' —
			// in other words, we re-run block/async effects with the newly
			// committed state, unless the batch in question has a more
			// recent value for a given source
			if (batches.size > 1) {
				this.previous.clear();

				var previous_batch_values = batch_values;
				var is_earlier = true;

				/** @type {EffectTarget} */
				var dummy_target = {
					parent: null,
					effect: null,
					effects: [],
					render_effects: []
				};

				for (const batch of batches) {
					if (batch === this) {
						is_earlier = false;
						continue;
					}

					/** @type {Source[]} */
					const sources = [];

					for (const [source, value] of this.current) {
						if (batch.current.has(source)) {
							if (is_earlier && value !== batch.current.get(source)) {
								// bring the value up to date
								batch.current.set(source, value);
							} else {
								// same value or later batch has more recent value,
								// no need to re-run these effects
								continue;
							}
						}

						sources.push(source);
					}

					if (sources.length === 0) {
						continue;
					}

					// Re-run async/block effects that depend on distinct values changed in both batches
					const others = [...batch.current.keys()].filter((s) => !this.current.has(s));
					if (others.length > 0) {
						// Avoid running queued root effects on the wrong branch
						var prev_queued_root_effects = queued_root_effects;
						queued_root_effects = [];

						/** @type {Set<Value>} */
						const marked = new Set();
						/** @type {Map<Reaction, boolean>} */
						const checked = new Map();
						for (const source of sources) {
							mark_effects(source, others, marked, checked);
						}

						if (queued_root_effects.length > 0) {
							current_batch = batch;
							batch.apply();

							for (const root of queued_root_effects) {
								batch.#traverse_effect_tree(root, dummy_target);
							}

							// TODO do we need to do anything with `target`? defer block effects?

							batch.deactivate();
						}

						queued_root_effects = prev_queued_root_effects;
					}
				}

				current_batch = null;
				batch_values = previous_batch_values;
			}

			this.committed = true;
			batches.delete(this);
		}

		/**
		 *
		 * @param {boolean} blocking
		 */
		increment(blocking) {
			this.#pending += 1;
			if (blocking) this.#blocking_pending += 1;
		}

		/**
		 *
		 * @param {boolean} blocking
		 */
		decrement(blocking) {
			this.#pending -= 1;
			if (blocking) this.#blocking_pending -= 1;

			this.revive();
		}

		revive() {
			for (const e of this.#dirty_effects) {
				this.#maybe_dirty_effects.delete(e);
				set_signal_status(e, DIRTY);
				schedule_effect(e);
			}

			for (const e of this.#maybe_dirty_effects) {
				set_signal_status(e, MAYBE_DIRTY);
				schedule_effect(e);
			}

			this.flush();
		}

		/** @param {() => void} fn */
		oncommit(fn) {
			this.#commit_callbacks.add(fn);
		}

		/** @param {(batch: Batch) => void} fn */
		ondiscard(fn) {
			this.#discard_callbacks.add(fn);
		}

		settled() {
			return (this.#deferred ??= deferred()).promise;
		}

		static ensure() {
			if (current_batch === null) {
				const batch = (current_batch = new Batch());
				batches.add(current_batch);

				if (!is_flushing_sync) {
					Batch.enqueue(() => {
						if (current_batch !== batch) {
							// a flushSync happened in the meantime
							return;
						}

						batch.flush();
					});
				}
			}

			return current_batch;
		}

		/** @param {() => void} task */
		static enqueue(task) {
			queue_micro_task(task);
		}

		apply() {
			return;
		}
	}

	/**
	 * Synchronously flush any pending updates.
	 * Returns void if no callback is provided, otherwise returns the result of calling the callback.
	 * @template [T=void]
	 * @param {(() => T) | undefined} [fn]
	 * @returns {T}
	 */
	function flushSync(fn) {
		var was_flushing_sync = is_flushing_sync;
		is_flushing_sync = true;

		try {
			var result;

			if (fn) ;

			while (true) {
				flush_tasks();

				if (queued_root_effects.length === 0) {
					current_batch?.flush();

					// we need to check again, in case we just updated an `$effect.pending()`
					if (queued_root_effects.length === 0) {
						// this would be reset in `flush_effects()` but since we are early returning here,
						// we need to reset it here as well in case the first time there's 0 queued root effects
						last_scheduled_effect = null;

						return /** @type {T} */ (result);
					}
				}

				flush_effects();
			}
		} finally {
			is_flushing_sync = was_flushing_sync;
		}
	}

	function flush_effects() {
		var was_updating_effect = is_updating_effect;
		is_flushing = true;

		var source_stacks = null;

		try {
			var flush_count = 0;
			set_is_updating_effect(true);

			while (queued_root_effects.length > 0) {
				var batch = Batch.ensure();

				if (flush_count++ > 1000) {
					var updates, entry; if (DEV) ;

					infinite_loop_guard();
				}

				batch.process(queued_root_effects);
				old_values.clear();

				if (DEV) ;
			}
		} finally {
			is_flushing = false;
			set_is_updating_effect(was_updating_effect);

			last_scheduled_effect = null;
		}
	}

	function infinite_loop_guard() {
		try {
			effect_update_depth_exceeded();
		} catch (error) {

			// Best effort: invoke the boundary nearest the most recent
			// effect and hope that it's relevant to the infinite loop
			invoke_error_boundary(error, last_scheduled_effect);
		}
	}

	/** @type {Set<Effect> | null} */
	let eager_block_effects = null;

	/**
	 * @param {Array<Effect>} effects
	 * @returns {void}
	 */
	function flush_queued_effects(effects) {
		var length = effects.length;
		if (length === 0) return;

		var i = 0;

		while (i < length) {
			var effect = effects[i++];

			if ((effect.f & (DESTROYED | INERT)) === 0 && is_dirty(effect)) {
				eager_block_effects = new Set();

				update_effect(effect);

				// Effects with no dependencies or teardown do not get added to the effect tree.
				// Deferred effects (e.g. `$effect(...)`) _are_ added to the tree because we
				// don't know if we need to keep them until they are executed. Doing the check
				// here (rather than in `update_effect`) allows us to skip the work for
				// immediate effects.
				if (effect.deps === null && effect.first === null && effect.nodes === null) {
					// if there's no teardown or abort controller we completely unlink
					// the effect from the graph
					if (effect.teardown === null && effect.ac === null) {
						// remove this effect from the graph
						unlink_effect(effect);
					} else {
						// keep the effect in the graph, but free up some memory
						effect.fn = null;
					}
				}

				// If update_effect() has a flushSync() in it, we may have flushed another flush_queued_effects(),
				// which already handled this logic and did set eager_block_effects to null.
				if (eager_block_effects?.size > 0) {
					old_values.clear();

					for (const e of eager_block_effects) {
						// Skip eager effects that have already been unmounted
						if ((e.f & (DESTROYED | INERT)) !== 0) continue;

						// Run effects in order from ancestor to descendant, else we could run into nullpointers
						/** @type {Effect[]} */
						const ordered_effects = [e];
						let ancestor = e.parent;
						while (ancestor !== null) {
							if (eager_block_effects.has(ancestor)) {
								eager_block_effects.delete(ancestor);
								ordered_effects.push(ancestor);
							}
							ancestor = ancestor.parent;
						}

						for (let j = ordered_effects.length - 1; j >= 0; j--) {
							const e = ordered_effects[j];
							// Skip eager effects that have already been unmounted
							if ((e.f & (DESTROYED | INERT)) !== 0) continue;
							update_effect(e);
						}
					}

					eager_block_effects.clear();
				}
			}
		}

		eager_block_effects = null;
	}

	/**
	 * This is similar to `mark_reactions`, but it only marks async/block effects
	 * depending on `value` and at least one of the other `sources`, so that
	 * these effects can re-run after another batch has been committed
	 * @param {Value} value
	 * @param {Source[]} sources
	 * @param {Set<Value>} marked
	 * @param {Map<Reaction, boolean>} checked
	 */
	function mark_effects(value, sources, marked, checked) {
		if (marked.has(value)) return;
		marked.add(value);

		if (value.reactions !== null) {
			for (const reaction of value.reactions) {
				const flags = reaction.f;

				if ((flags & DERIVED) !== 0) {
					mark_effects(/** @type {Derived} */ (reaction), sources, marked, checked);
				} else if (
					(flags & (ASYNC | BLOCK_EFFECT)) !== 0 &&
					(flags & DIRTY) === 0 &&
					depends_on(reaction, sources, checked)
				) {
					set_signal_status(reaction, DIRTY);
					schedule_effect(/** @type {Effect} */ (reaction));
				}
			}
		}
	}

	/**
	 * @param {Reaction} reaction
	 * @param {Source[]} sources
	 * @param {Map<Reaction, boolean>} checked
	 */
	function depends_on(reaction, sources, checked) {
		const depends = checked.get(reaction);
		if (depends !== undefined) return depends;

		if (reaction.deps !== null) {
			for (const dep of reaction.deps) {
				if (sources.includes(dep)) {
					return true;
				}

				if ((dep.f & DERIVED) !== 0 && depends_on(/** @type {Derived} */ (dep), sources, checked)) {
					checked.set(/** @type {Derived} */ (dep), true);
					return true;
				}
			}
		}

		checked.set(reaction, false);

		return false;
	}

	/**
	 * @param {Effect} signal
	 * @returns {void}
	 */
	function schedule_effect(signal) {
		var effect = (last_scheduled_effect = signal);

		while (effect.parent !== null) {
			effect = effect.parent;
			var flags = effect.f;

			// if the effect is being scheduled because a parent (each/await/etc) block
			// updated an internal source, bail out or we'll cause a second flush
			if (
				is_flushing &&
				effect === active_effect &&
				(flags & BLOCK_EFFECT) !== 0 &&
				(flags & HEAD_EFFECT) === 0
			) {
				return;
			}

			if ((flags & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
				if ((flags & CLEAN) === 0) return;
				effect.f ^= CLEAN;
			}
		}

		queued_root_effects.push(effect);
	}

	/**
	 * Returns a `subscribe` function that integrates external event-based systems with Svelte's reactivity.
	 * It's particularly useful for integrating with web APIs like `MediaQuery`, `IntersectionObserver`, or `WebSocket`.
	 *
	 * If `subscribe` is called inside an effect (including indirectly, for example inside a getter),
	 * the `start` callback will be called with an `update` function. Whenever `update` is called, the effect re-runs.
	 *
	 * If `start` returns a cleanup function, it will be called when the effect is destroyed.
	 *
	 * If `subscribe` is called in multiple effects, `start` will only be called once as long as the effects
	 * are active, and the returned teardown function will only be called when all effects are destroyed.
	 *
	 * It's best understood with an example. Here's an implementation of [`MediaQuery`](https://svelte.dev/docs/svelte/svelte-reactivity#MediaQuery):
	 *
	 * ```js
	 * import { createSubscriber } from 'svelte/reactivity';
	 * import { on } from 'svelte/events';
	 *
	 * export class MediaQuery {
	 * 	#query;
	 * 	#subscribe;
	 *
	 * 	constructor(query) {
	 * 		this.#query = window.matchMedia(`(${query})`);
	 *
	 * 		this.#subscribe = createSubscriber((update) => {
	 * 			// when the `change` event occurs, re-run any effects that read `this.current`
	 * 			const off = on(this.#query, 'change', update);
	 *
	 * 			// stop listening when all the effects are destroyed
	 * 			return () => off();
	 * 		});
	 * 	}
	 *
	 * 	get current() {
	 * 		// This makes the getter reactive, if read in an effect
	 * 		this.#subscribe();
	 *
	 * 		// Return the current state of the query, whether or not we're in an effect
	 * 		return this.#query.matches;
	 * 	}
	 * }
	 * ```
	 * @param {(update: () => void) => (() => void) | void} start
	 * @since 5.7.0
	 */
	function createSubscriber(start) {
		let subscribers = 0;
		let version = source(0);
		/** @type {(() => void) | void} */
		let stop;

		return () => {
			if (effect_tracking()) {
				get(version);

				render_effect(() => {
					if (subscribers === 0) {
						stop = untrack(() => start(() => increment(version)));
					}

					subscribers += 1;

					return () => {
						queue_micro_task(() => {
							// Only count down after a microtask, else we would reach 0 before our own render effect reruns,
							// but reach 1 again when the tick callback of the prior teardown runs. That would mean we
							// re-subcribe unnecessarily and create a memory leak because the old subscription is never cleaned up.
							subscribers -= 1;

							if (subscribers === 0) {
								stop?.();
								stop = undefined;
								// Increment the version to ensure any dependent deriveds are marked dirty when the subscription is picked up again later.
								// If we didn't do this then the comparison of write versions would determine that the derived has a later version than
								// the subscriber, and it would not be re-run.
								increment(version);
							}
						});
					};
				});
			}
		};
	}

	/** @import { Effect, Source, TemplateNode, } from '#client' */

	/**
	 * @typedef {{
	 * 	 onerror?: (error: unknown, reset: () => void) => void;
	 *   failed?: (anchor: Node, error: () => unknown, reset: () => () => void) => void;
	 *   pending?: (anchor: Node) => void;
	 * }} BoundaryProps
	 */

	var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED | BOUNDARY_EFFECT;

	/**
	 * @param {TemplateNode} node
	 * @param {BoundaryProps} props
	 * @param {((anchor: Node) => void)} children
	 * @returns {void}
	 */
	function boundary(node, props, children) {
		new Boundary(node, props, children);
	}

	class Boundary {
		/** @type {Boundary | null} */
		parent;

		#pending = false;

		/** @type {TemplateNode} */
		#anchor;

		/** @type {TemplateNode | null} */
		#hydrate_open = hydrating ? hydrate_node : null;

		/** @type {BoundaryProps} */
		#props;

		/** @type {((anchor: Node) => void)} */
		#children;

		/** @type {Effect} */
		#effect;

		/** @type {Effect | null} */
		#main_effect = null;

		/** @type {Effect | null} */
		#pending_effect = null;

		/** @type {Effect | null} */
		#failed_effect = null;

		/** @type {DocumentFragment | null} */
		#offscreen_fragment = null;

		/** @type {TemplateNode | null} */
		#pending_anchor = null;

		#local_pending_count = 0;
		#pending_count = 0;

		#is_creating_fallback = false;

		/**
		 * A source containing the number of pending async deriveds/expressions.
		 * Only created if `$effect.pending()` is used inside the boundary,
		 * otherwise updating the source results in needless `Batch.ensure()`
		 * calls followed by no-op flushes
		 * @type {Source<number> | null}
		 */
		#effect_pending = null;

		#effect_pending_subscriber = createSubscriber(() => {
			this.#effect_pending = source(this.#local_pending_count);

			return () => {
				this.#effect_pending = null;
			};
		});

		/**
		 * @param {TemplateNode} node
		 * @param {BoundaryProps} props
		 * @param {((anchor: Node) => void)} children
		 */
		constructor(node, props, children) {
			this.#anchor = node;
			this.#props = props;
			this.#children = children;

			this.parent = /** @type {Effect} */ (active_effect).b;

			this.#pending = !!this.#props.pending;

			this.#effect = block(() => {
				/** @type {Effect} */ (active_effect).b = this;

				if (hydrating) {
					const comment = this.#hydrate_open;
					hydrate_next();

					const server_rendered_pending =
						/** @type {Comment} */ (comment).nodeType === COMMENT_NODE &&
						/** @type {Comment} */ (comment).data === HYDRATION_START_ELSE;

					if (server_rendered_pending) {
						this.#hydrate_pending_content();
					} else {
						this.#hydrate_resolved_content();
					}
				} else {
					var anchor = this.#get_anchor();

					try {
						this.#main_effect = branch(() => children(anchor));
					} catch (error) {
						this.error(error);
					}

					if (this.#pending_count > 0) {
						this.#show_pending_snippet();
					} else {
						this.#pending = false;
					}
				}

				return () => {
					this.#pending_anchor?.remove();
				};
			}, flags);

			if (hydrating) {
				this.#anchor = hydrate_node;
			}
		}

		#hydrate_resolved_content() {
			try {
				this.#main_effect = branch(() => this.#children(this.#anchor));
			} catch (error) {
				this.error(error);
			}

			// Since server rendered resolved content, we never show pending state
			// Even if client-side async operations are still running, the content is already displayed
			this.#pending = false;
		}

		#hydrate_pending_content() {
			const pending = this.#props.pending;
			if (!pending) {
				return;
			}
			this.#pending_effect = branch(() => pending(this.#anchor));

			Batch.enqueue(() => {
				var anchor = this.#get_anchor();

				this.#main_effect = this.#run(() => {
					Batch.ensure();
					return branch(() => this.#children(anchor));
				});

				if (this.#pending_count > 0) {
					this.#show_pending_snippet();
				} else {
					pause_effect(/** @type {Effect} */ (this.#pending_effect), () => {
						this.#pending_effect = null;
					});

					this.#pending = false;
				}
			});
		}

		#get_anchor() {
			var anchor = this.#anchor;

			if (this.#pending) {
				this.#pending_anchor = create_text();
				this.#anchor.before(this.#pending_anchor);

				anchor = this.#pending_anchor;
			}

			return anchor;
		}

		/**
		 * Returns `true` if the effect exists inside a boundary whose pending snippet is shown
		 * @returns {boolean}
		 */
		is_pending() {
			return this.#pending || (!!this.parent && this.parent.is_pending());
		}

		has_pending_snippet() {
			return !!this.#props.pending;
		}

		/**
		 * @param {() => Effect | null} fn
		 */
		#run(fn) {
			var previous_effect = active_effect;
			var previous_reaction = active_reaction;
			var previous_ctx = component_context;

			set_active_effect(this.#effect);
			set_active_reaction(this.#effect);
			set_component_context(this.#effect.ctx);

			try {
				return fn();
			} catch (e) {
				handle_error(e);
				return null;
			} finally {
				set_active_effect(previous_effect);
				set_active_reaction(previous_reaction);
				set_component_context(previous_ctx);
			}
		}

		#show_pending_snippet() {
			const pending = /** @type {(anchor: Node) => void} */ (this.#props.pending);

			if (this.#main_effect !== null) {
				this.#offscreen_fragment = document.createDocumentFragment();
				this.#offscreen_fragment.append(/** @type {TemplateNode} */ (this.#pending_anchor));
				move_effect(this.#main_effect, this.#offscreen_fragment);
			}

			if (this.#pending_effect === null) {
				this.#pending_effect = branch(() => pending(this.#anchor));
			}
		}

		/**
		 * Updates the pending count associated with the currently visible pending snippet,
		 * if any, such that we can replace the snippet with content once work is done
		 * @param {1 | -1} d
		 */
		#update_pending_count(d) {
			if (!this.has_pending_snippet()) {
				if (this.parent) {
					this.parent.#update_pending_count(d);
				}

				// if there's no parent, we're in a scope with no pending snippet
				return;
			}

			this.#pending_count += d;

			if (this.#pending_count === 0) {
				this.#pending = false;

				if (this.#pending_effect) {
					pause_effect(this.#pending_effect, () => {
						this.#pending_effect = null;
					});
				}

				if (this.#offscreen_fragment) {
					this.#anchor.before(this.#offscreen_fragment);
					this.#offscreen_fragment = null;
				}
			}
		}

		/**
		 * Update the source that powers `$effect.pending()` inside this boundary,
		 * and controls when the current `pending` snippet (if any) is removed.
		 * Do not call from inside the class
		 * @param {1 | -1} d
		 */
		update_pending_count(d) {
			this.#update_pending_count(d);

			this.#local_pending_count += d;

			if (this.#effect_pending) {
				internal_set(this.#effect_pending, this.#local_pending_count);
			}
		}

		get_effect_pending() {
			this.#effect_pending_subscriber();
			return get(/** @type {Source<number>} */ (this.#effect_pending));
		}

		/** @param {unknown} error */
		error(error) {
			var onerror = this.#props.onerror;
			let failed = this.#props.failed;

			// If we have nothing to capture the error, or if we hit an error while
			// rendering the fallback, re-throw for another boundary to handle
			if (this.#is_creating_fallback || (!onerror && !failed)) {
				throw error;
			}

			if (this.#main_effect) {
				destroy_effect(this.#main_effect);
				this.#main_effect = null;
			}

			if (this.#pending_effect) {
				destroy_effect(this.#pending_effect);
				this.#pending_effect = null;
			}

			if (this.#failed_effect) {
				destroy_effect(this.#failed_effect);
				this.#failed_effect = null;
			}

			if (hydrating) {
				set_hydrate_node(/** @type {TemplateNode} */ (this.#hydrate_open));
				next();
				set_hydrate_node(skip_nodes());
			}

			var did_reset = false;
			var calling_on_error = false;

			const reset = () => {
				if (did_reset) {
					svelte_boundary_reset_noop();
					return;
				}

				did_reset = true;

				if (calling_on_error) {
					svelte_boundary_reset_onerror();
				}

				// If the failure happened while flushing effects, current_batch can be null
				Batch.ensure();

				this.#local_pending_count = 0;

				if (this.#failed_effect !== null) {
					pause_effect(this.#failed_effect, () => {
						this.#failed_effect = null;
					});
				}

				// we intentionally do not try to find the nearest pending boundary. If this boundary has one, we'll render it on reset
				// but it would be really weird to show the parent's boundary on a child reset.
				this.#pending = this.has_pending_snippet();

				this.#main_effect = this.#run(() => {
					this.#is_creating_fallback = false;
					return branch(() => this.#children(this.#anchor));
				});

				if (this.#pending_count > 0) {
					this.#show_pending_snippet();
				} else {
					this.#pending = false;
				}
			};

			var previous_reaction = active_reaction;

			try {
				set_active_reaction(null);
				calling_on_error = true;
				onerror?.(error, reset);
				calling_on_error = false;
			} catch (error) {
				invoke_error_boundary(error, this.#effect && this.#effect.parent);
			} finally {
				set_active_reaction(previous_reaction);
			}

			if (failed) {
				queue_micro_task(() => {
					this.#failed_effect = this.#run(() => {
						Batch.ensure();
						this.#is_creating_fallback = true;

						try {
							return branch(() => {
								failed(
									this.#anchor,
									() => error,
									() => reset
								);
							});
						} catch (error) {
							invoke_error_boundary(error, /** @type {Effect} */ (this.#effect.parent));
							return null;
						} finally {
							this.#is_creating_fallback = false;
						}
					});
				});
			}
		}
	}

	/** @import { Effect, TemplateNode, Value } from '#client' */

	/**
	 * @param {Array<Promise<void>>} blockers
	 * @param {Array<() => any>} sync
	 * @param {Array<() => Promise<any>>} async
	 * @param {(values: Value[]) => any} fn
	 */
	function flatten(blockers, sync, async, fn) {
		const d = is_runes() ? derived : derived_safe_equal;

		if (async.length === 0 && blockers.length === 0) {
			fn(sync.map(d));
			return;
		}

		var batch = current_batch;
		var parent = /** @type {Effect} */ (active_effect);

		var restore = capture();

		function run() {
			Promise.all(async.map((expression) => async_derived(expression)))
				.then((result) => {
					restore();

					try {
						fn([...sync.map(d), ...result]);
					} catch (error) {
						// ignore errors in blocks that have already been destroyed
						if ((parent.f & DESTROYED) === 0) {
							invoke_error_boundary(error, parent);
						}
					}

					batch?.deactivate();
					unset_context();
				})
				.catch((error) => {
					invoke_error_boundary(error, parent);
				});
		}

		if (blockers.length > 0) {
			Promise.all(blockers).then(() => {
				restore();

				try {
					return run();
				} finally {
					batch?.deactivate();
					unset_context();
				}
			});
		} else {
			run();
		}
	}

	/**
	 * Captures the current effect context so that we can restore it after
	 * some asynchronous work has happened (so that e.g. `await a + b`
	 * causes `b` to be registered as a dependency).
	 */
	function capture() {
		var previous_effect = active_effect;
		var previous_reaction = active_reaction;
		var previous_component_context = component_context;
		var previous_batch = current_batch;

		return function restore(activate_batch = true) {
			set_active_effect(previous_effect);
			set_active_reaction(previous_reaction);
			set_component_context(previous_component_context);
			if (activate_batch) previous_batch?.activate();
		};
	}

	function unset_context() {
		set_active_effect(null);
		set_active_reaction(null);
		set_component_context(null);
	}

	/** @import { Derived, Effect, Source } from '#client' */
	/** @import { Batch } from './batch.js'; */

	/**
	 * @template V
	 * @param {() => V} fn
	 * @returns {Derived<V>}
	 */
	/*#__NO_SIDE_EFFECTS__*/
	function derived(fn) {
		var flags = DERIVED | DIRTY;
		var parent_derived =
			active_reaction !== null && (active_reaction.f & DERIVED) !== 0
				? /** @type {Derived} */ (active_reaction)
				: null;

		if (active_effect !== null) {
			// Since deriveds are evaluated lazily, any effects created inside them are
			// created too late to ensure that the parent effect is added to the tree
			active_effect.f |= EFFECT_PRESERVED;
		}

		/** @type {Derived<V>} */
		const signal = {
			ctx: component_context,
			deps: null,
			effects: null,
			equals,
			f: flags,
			fn,
			reactions: null,
			rv: 0,
			v: /** @type {V} */ (UNINITIALIZED),
			wv: 0,
			parent: parent_derived ?? active_effect,
			ac: null
		};

		return signal;
	}

	/**
	 * @template V
	 * @param {() => V | Promise<V>} fn
	 * @param {string} [location] If provided, print a warning if the value is not read immediately after update
	 * @returns {Promise<Source<V>>}
	 */
	/*#__NO_SIDE_EFFECTS__*/
	function async_derived(fn, location) {
		let parent = /** @type {Effect | null} */ (active_effect);

		if (parent === null) {
			async_derived_orphan();
		}

		var boundary = /** @type {Boundary} */ (parent.b);

		var promise = /** @type {Promise<V>} */ (/** @type {unknown} */ (undefined));
		var signal = source(/** @type {V} */ (UNINITIALIZED));

		// only suspend in async deriveds created on initialisation
		var should_suspend = !active_reaction;

		/** @type {Map<Batch, ReturnType<typeof deferred<V>>>} */
		var deferreds = new Map();

		async_effect(() => {

			/** @type {ReturnType<typeof deferred<V>>} */
			var d = deferred();
			promise = d.promise;

			try {
				// If this code is changed at some point, make sure to still access the then property
				// of fn() to read any signals it might access, so that we track them as dependencies.
				// We call `unset_context` to undo any `save` calls that happen inside `fn()`
				Promise.resolve(fn())
					.then(d.resolve, d.reject)
					.then(() => {
						if (batch === current_batch && batch.committed) {
							// if the batch was rejected as stale, we need to cleanup
							// after any `$.save(...)` calls inside `fn()`
							batch.deactivate();
						}

						unset_context();
					});
			} catch (error) {
				d.reject(error);
				unset_context();
			}

			var batch = /** @type {Batch} */ (current_batch);

			if (should_suspend) {
				var blocking = !boundary.is_pending();

				boundary.update_pending_count(1);
				batch.increment(blocking);

				deferreds.get(batch)?.reject(STALE_REACTION);
				deferreds.delete(batch); // delete to ensure correct order in Map iteration below
				deferreds.set(batch, d);
			}

			/**
			 * @param {any} value
			 * @param {unknown} error
			 */
			const handler = (value, error = undefined) => {

				batch.activate();

				if (error) {
					if (error !== STALE_REACTION) {
						signal.f |= ERROR_VALUE;

						// @ts-expect-error the error is the wrong type, but we don't care
						internal_set(signal, error);
					}
				} else {
					if ((signal.f & ERROR_VALUE) !== 0) {
						signal.f ^= ERROR_VALUE;
					}

					internal_set(signal, value);

					// All prior async derived runs are now stale
					for (const [b, d] of deferreds) {
						deferreds.delete(b);
						if (b === batch) break;
						d.reject(STALE_REACTION);
					}
				}

				if (should_suspend) {
					boundary.update_pending_count(-1);
					batch.decrement(blocking);
				}
			};

			d.promise.then(handler, (e) => handler(null, e || 'unknown'));
		});

		teardown(() => {
			for (const d of deferreds.values()) {
				d.reject(STALE_REACTION);
			}
		});

		return new Promise((fulfil) => {
			/** @param {Promise<V>} p */
			function next(p) {
				function go() {
					if (p === promise) {
						fulfil(signal);
					} else {
						// if the effect re-runs before the initial promise
						// resolves, delay resolution until we have a value
						next(promise);
					}
				}

				p.then(go, go);
			}

			next(promise);
		});
	}

	/**
	 * @template V
	 * @param {() => V} fn
	 * @returns {Derived<V>}
	 */
	/*#__NO_SIDE_EFFECTS__*/
	function user_derived(fn) {
		const d = derived(fn);

		push_reaction_value(d);

		return d;
	}

	/**
	 * @template V
	 * @param {() => V} fn
	 * @returns {Derived<V>}
	 */
	/*#__NO_SIDE_EFFECTS__*/
	function derived_safe_equal(fn) {
		const signal = derived(fn);
		signal.equals = safe_equals;
		return signal;
	}

	/**
	 * @param {Derived} derived
	 * @returns {void}
	 */
	function destroy_derived_effects(derived) {
		var effects = derived.effects;

		if (effects !== null) {
			derived.effects = null;

			for (var i = 0; i < effects.length; i += 1) {
				destroy_effect(/** @type {Effect} */ (effects[i]));
			}
		}
	}

	/**
	 * @param {Derived} derived
	 * @returns {Effect | null}
	 */
	function get_derived_parent_effect(derived) {
		var parent = derived.parent;
		while (parent !== null) {
			if ((parent.f & DERIVED) === 0) {
				// The original parent effect might've been destroyed but the derived
				// is used elsewhere now - do not return the destroyed effect in that case
				return (parent.f & DESTROYED) === 0 ? /** @type {Effect} */ (parent) : null;
			}
			parent = parent.parent;
		}
		return null;
	}

	/**
	 * @template T
	 * @param {Derived} derived
	 * @returns {T}
	 */
	function execute_derived(derived) {
		var value;
		var prev_active_effect = active_effect;

		set_active_effect(get_derived_parent_effect(derived));

		{
			try {
				derived.f &= ~WAS_MARKED;
				destroy_derived_effects(derived);
				value = update_reaction(derived);
			} finally {
				set_active_effect(prev_active_effect);
			}
		}

		return value;
	}

	/**
	 * @param {Derived} derived
	 * @returns {void}
	 */
	function update_derived(derived) {
		var value = execute_derived(derived);

		if (!derived.equals(value)) {
			// in a fork, we don't update the underlying value, just `batch_values`.
			// the underlying value will be updated when the fork is committed.
			// otherwise, the next time we get here after a 'real world' state
			// change, `derived.equals` may incorrectly return `true`
			if (!current_batch?.is_fork) {
				derived.v = value;
			}

			derived.wv = increment_write_version();
		}

		// don't mark derived clean if we're reading it inside a
		// cleanup function, or it will cache a stale value
		if (is_destroying_effect) {
			return;
		}

		// During time traveling we don't want to reset the status so that
		// traversal of the graph in the other batches still happens
		if (batch_values !== null) {
			// only cache the value if we're in a tracking context, otherwise we won't
			// clear the cache in `mark_reactions` when dependencies are updated
			if (effect_tracking() || current_batch?.is_fork) {
				batch_values.set(derived, value);
			}
		} else {
			var status = (derived.f & CONNECTED) === 0 ? MAYBE_DIRTY : CLEAN;
			set_signal_status(derived, status);
		}
	}

	/** @import { Derived, Effect, Source, Value } from '#client' */

	/** @type {Set<any>} */
	let eager_effects = new Set();

	/** @type {Map<Source, any>} */
	const old_values = new Map();

	let eager_effects_deferred = false;

	/**
	 * @template V
	 * @param {V} v
	 * @param {Error | null} [stack]
	 * @returns {Source<V>}
	 */
	// TODO rename this to `state` throughout the codebase
	function source(v, stack) {
		/** @type {Value} */
		var signal = {
			f: 0, // TODO ideally we could skip this altogether, but it causes type errors
			v,
			reactions: null,
			equals,
			rv: 0,
			wv: 0
		};

		return signal;
	}

	/**
	 * @template V
	 * @param {V} v
	 * @param {Error | null} [stack]
	 */
	/*#__NO_SIDE_EFFECTS__*/
	function state(v, stack) {
		const s = source(v);

		push_reaction_value(s);

		return s;
	}

	/**
	 * @template V
	 * @param {V} initial_value
	 * @param {boolean} [immutable]
	 * @returns {Source<V>}
	 */
	/*#__NO_SIDE_EFFECTS__*/
	function mutable_source(initial_value, immutable = false, trackable = true) {
		const s = source(initial_value);
		if (!immutable) {
			s.equals = safe_equals;
		}

		// bind the signal to the component context, in case we need to
		// track updates to trigger beforeUpdate/afterUpdate callbacks
		if (legacy_mode_flag && trackable && component_context !== null && component_context.l !== null) {
			(component_context.l.s ??= []).push(s);
		}

		return s;
	}

	/**
	 * @template V
	 * @param {Source<V>} source
	 * @param {V} value
	 * @param {boolean} [should_proxy]
	 * @returns {V}
	 */
	function set(source, value, should_proxy = false) {
		if (
			active_reaction !== null &&
			// since we are untracking the function inside `$inspect.with` we need to add this check
			// to ensure we error if state is set inside an inspect effect
			(!untracking || (active_reaction.f & EAGER_EFFECT) !== 0) &&
			is_runes() &&
			(active_reaction.f & (DERIVED | BLOCK_EFFECT | ASYNC | EAGER_EFFECT)) !== 0 &&
			!current_sources?.includes(source)
		) {
			state_unsafe_mutation();
		}

		let new_value = should_proxy ? proxy(value) : value;

		return internal_set(source, new_value);
	}

	/**
	 * @template V
	 * @param {Source<V>} source
	 * @param {V} value
	 * @returns {V}
	 */
	function internal_set(source, value) {
		if (!source.equals(value)) {
			var old_value = source.v;

			if (is_destroying_effect) {
				old_values.set(source, value);
			} else {
				old_values.set(source, old_value);
			}

			source.v = value;

			var batch = Batch.ensure();
			batch.capture(source, old_value);

			if ((source.f & DERIVED) !== 0) {
				// if we are assigning to a dirty derived we set it to clean/maybe dirty but we also eagerly execute it to track the dependencies
				if ((source.f & DIRTY) !== 0) {
					execute_derived(/** @type {Derived} */ (source));
				}

				set_signal_status(source, (source.f & CONNECTED) !== 0 ? CLEAN : MAYBE_DIRTY);
			}

			source.wv = increment_write_version();

			// For debugging, in case you want to know which reactions are being scheduled:
			// log_reactions(source);
			mark_reactions(source, DIRTY);

			// It's possible that the current reaction might not have up-to-date dependencies
			// whilst it's actively running. So in the case of ensuring it registers the reaction
			// properly for itself, we need to ensure the current effect actually gets
			// scheduled. i.e: `$effect(() => x++)`
			if (
				is_runes() &&
				active_effect !== null &&
				(active_effect.f & CLEAN) !== 0 &&
				(active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0
			) {
				if (untracked_writes === null) {
					set_untracked_writes([source]);
				} else {
					untracked_writes.push(source);
				}
			}

			if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) {
				flush_eager_effects();
			}
		}

		return value;
	}

	function flush_eager_effects() {
		eager_effects_deferred = false;
		var prev_is_updating_effect = is_updating_effect;
		set_is_updating_effect(true);

		const inspects = Array.from(eager_effects);

		try {
			for (const effect of inspects) {
				// Mark clean inspect-effects as maybe dirty and then check their dirtiness
				// instead of just updating the effects - this way we avoid overfiring.
				if ((effect.f & CLEAN) !== 0) {
					set_signal_status(effect, MAYBE_DIRTY);
				}

				if (is_dirty(effect)) {
					update_effect(effect);
				}
			}
		} finally {
			set_is_updating_effect(prev_is_updating_effect);
		}

		eager_effects.clear();
	}

	/**
	 * Silently (without using `get`) increment a source
	 * @param {Source<number>} source
	 */
	function increment(source) {
		set(source, source.v + 1);
	}

	/**
	 * @param {Value} signal
	 * @param {number} status should be DIRTY or MAYBE_DIRTY
	 * @returns {void}
	 */
	function mark_reactions(signal, status) {
		var reactions = signal.reactions;
		if (reactions === null) return;

		var runes = is_runes();
		var length = reactions.length;

		for (var i = 0; i < length; i++) {
			var reaction = reactions[i];
			var flags = reaction.f;

			// In legacy mode, skip the current effect to prevent infinite loops
			if (!runes && reaction === active_effect) continue;

			var not_dirty = (flags & DIRTY) === 0;

			// don't set a DIRTY reaction to MAYBE_DIRTY
			if (not_dirty) {
				set_signal_status(reaction, status);
			}

			if ((flags & DERIVED) !== 0) {
				var derived = /** @type {Derived} */ (reaction);

				batch_values?.delete(derived);

				if ((flags & WAS_MARKED) === 0) {
					// Only connected deriveds can be reliably unmarked right away
					if (flags & CONNECTED) {
						reaction.f |= WAS_MARKED;
					}

					mark_reactions(derived, MAYBE_DIRTY);
				}
			} else if (not_dirty) {
				if ((flags & BLOCK_EFFECT) !== 0 && eager_block_effects !== null) {
					eager_block_effects.add(/** @type {Effect} */ (reaction));
				}

				schedule_effect(/** @type {Effect} */ (reaction));
			}
		}
	}

	/** @import { Source } from '#client' */

	/**
	 * @template T
	 * @param {T} value
	 * @returns {T}
	 */
	function proxy(value) {
		// if non-proxyable, or is already a proxy, return `value`
		if (typeof value !== 'object' || value === null || STATE_SYMBOL in value) {
			return value;
		}

		const prototype = get_prototype_of(value);

		if (prototype !== object_prototype && prototype !== array_prototype) {
			return value;
		}

		/** @type {Map<any, Source<any>>} */
		var sources = new Map();
		var is_proxied_array = is_array(value);
		var version = state(0);
		var parent_version = update_version;

		/**
		 * Executes the proxy in the context of the reaction it was originally created in, if any
		 * @template T
		 * @param {() => T} fn
		 */
		var with_parent = (fn) => {
			if (update_version === parent_version) {
				return fn();
			}

			// child source is being created after the initial proxy —
			// prevent it from being associated with the current reaction
			var reaction = active_reaction;
			var version = update_version;

			set_active_reaction(null);
			set_update_version(parent_version);

			var result = fn();

			set_active_reaction(reaction);
			set_update_version(version);

			return result;
		};

		if (is_proxied_array) {
			// We need to create the length source eagerly to ensure that
			// mutations to the array are properly synced with our proxy
			sources.set('length', state(/** @type {any[]} */ (value).length));
		}

		return new Proxy(/** @type {any} */ (value), {
			defineProperty(_, prop, descriptor) {
				if (
					!('value' in descriptor) ||
					descriptor.configurable === false ||
					descriptor.enumerable === false ||
					descriptor.writable === false
				) {
					// we disallow non-basic descriptors, because unless they are applied to the
					// target object — which we avoid, so that state can be forked — we will run
					// afoul of the various invariants
					// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/getOwnPropertyDescriptor#invariants
					state_descriptors_fixed();
				}
				var s = sources.get(prop);
				if (s === undefined) {
					s = with_parent(() => {
						var s = state(descriptor.value);
						sources.set(prop, s);
						return s;
					});
				} else {
					set(s, descriptor.value, true);
				}

				return true;
			},

			deleteProperty(target, prop) {
				var s = sources.get(prop);

				if (s === undefined) {
					if (prop in target) {
						const s = with_parent(() => state(UNINITIALIZED));
						sources.set(prop, s);
						increment(version);
					}
				} else {
					set(s, UNINITIALIZED);
					increment(version);
				}

				return true;
			},

			get(target, prop, receiver) {
				if (prop === STATE_SYMBOL) {
					return value;
				}

				var s = sources.get(prop);
				var exists = prop in target;

				// create a source, but only if it's an own property and not a prototype property
				if (s === undefined && (!exists || get_descriptor(target, prop)?.writable)) {
					s = with_parent(() => {
						var p = proxy(exists ? target[prop] : UNINITIALIZED);
						var s = state(p);

						return s;
					});

					sources.set(prop, s);
				}

				if (s !== undefined) {
					var v = get(s);
					return v === UNINITIALIZED ? undefined : v;
				}

				return Reflect.get(target, prop, receiver);
			},

			getOwnPropertyDescriptor(target, prop) {
				var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);

				if (descriptor && 'value' in descriptor) {
					var s = sources.get(prop);
					if (s) descriptor.value = get(s);
				} else if (descriptor === undefined) {
					var source = sources.get(prop);
					var value = source?.v;

					if (source !== undefined && value !== UNINITIALIZED) {
						return {
							enumerable: true,
							configurable: true,
							value,
							writable: true
						};
					}
				}

				return descriptor;
			},

			has(target, prop) {
				if (prop === STATE_SYMBOL) {
					return true;
				}

				var s = sources.get(prop);
				var has = (s !== undefined && s.v !== UNINITIALIZED) || Reflect.has(target, prop);

				if (
					s !== undefined ||
					(active_effect !== null && (!has || get_descriptor(target, prop)?.writable))
				) {
					if (s === undefined) {
						s = with_parent(() => {
							var p = has ? proxy(target[prop]) : UNINITIALIZED;
							var s = state(p);

							return s;
						});

						sources.set(prop, s);
					}

					var value = get(s);
					if (value === UNINITIALIZED) {
						return false;
					}
				}

				return has;
			},

			set(target, prop, value, receiver) {
				var s = sources.get(prop);
				var has = prop in target;

				// variable.length = value -> clear all signals with index >= value
				if (is_proxied_array && prop === 'length') {
					for (var i = value; i < /** @type {Source<number>} */ (s).v; i += 1) {
						var other_s = sources.get(i + '');
						if (other_s !== undefined) {
							set(other_s, UNINITIALIZED);
						} else if (i in target) {
							// If the item exists in the original, we need to create an uninitialized source,
							// else a later read of the property would result in a source being created with
							// the value of the original item at that index.
							other_s = with_parent(() => state(UNINITIALIZED));
							sources.set(i + '', other_s);
						}
					}
				}

				// If we haven't yet created a source for this property, we need to ensure
				// we do so otherwise if we read it later, then the write won't be tracked and
				// the heuristics of effects will be different vs if we had read the proxied
				// object property before writing to that property.
				if (s === undefined) {
					if (!has || get_descriptor(target, prop)?.writable) {
						s = with_parent(() => state(undefined));
						set(s, proxy(value));

						sources.set(prop, s);
					}
				} else {
					has = s.v !== UNINITIALIZED;

					var p = with_parent(() => proxy(value));
					set(s, p);
				}

				var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);

				// Set the new value before updating any signals so that any listeners get the new value
				if (descriptor?.set) {
					descriptor.set.call(receiver, value);
				}

				if (!has) {
					// If we have mutated an array directly, we might need to
					// signal that length has also changed. Do it before updating metadata
					// to ensure that iterating over the array as a result of a metadata update
					// will not cause the length to be out of sync.
					if (is_proxied_array && typeof prop === 'string') {
						var ls = /** @type {Source<number>} */ (sources.get('length'));
						var n = Number(prop);

						if (Number.isInteger(n) && n >= ls.v) {
							set(ls, n + 1);
						}
					}

					increment(version);
				}

				return true;
			},

			ownKeys(target) {
				get(version);

				var own_keys = Reflect.ownKeys(target).filter((key) => {
					var source = sources.get(key);
					return source === undefined || source.v !== UNINITIALIZED;
				});

				for (var [key, source] of sources) {
					if (source.v !== UNINITIALIZED && !(key in target)) {
						own_keys.push(key);
					}
				}

				return own_keys;
			},

			setPrototypeOf() {
				state_prototype_fixed();
			}
		});
	}

	/**
	 * @param {any} value
	 */
	function get_proxied_value(value) {
		try {
			if (value !== null && typeof value === 'object' && STATE_SYMBOL in value) {
				return value[STATE_SYMBOL];
			}
		} catch {
			// the above if check can throw an error if the value in question
			// is the contentWindow of an iframe on another domain, in which
			// case we want to just return the value (because it's definitely
			// not a proxied value) so we don't break any JavaScript interacting
			// with that iframe (such as various payment companies client side
			// JavaScript libraries interacting with their iframes on the same
			// domain)
		}

		return value;
	}

	/**
	 * @param {any} a
	 * @param {any} b
	 */
	function is(a, b) {
		return Object.is(get_proxied_value(a), get_proxied_value(b));
	}

	/** @import { Effect, TemplateNode } from '#client' */

	// export these for reference in the compiled code, making global name deduplication unnecessary
	/** @type {Window} */
	var $window;

	/** @type {boolean} */
	var is_firefox;

	/** @type {() => Node | null} */
	var first_child_getter;
	/** @type {() => Node | null} */
	var next_sibling_getter;

	/**
	 * Initialize these lazily to avoid issues when using the runtime in a server context
	 * where these globals are not available while avoiding a separate server entry point
	 */
	function init_operations() {
		if ($window !== undefined) {
			return;
		}

		$window = window;
		is_firefox = /Firefox/.test(navigator.userAgent);

		var element_prototype = Element.prototype;
		var node_prototype = Node.prototype;
		var text_prototype = Text.prototype;

		// @ts-ignore
		first_child_getter = get_descriptor(node_prototype, 'firstChild').get;
		// @ts-ignore
		next_sibling_getter = get_descriptor(node_prototype, 'nextSibling').get;

		if (is_extensible(element_prototype)) {
			// the following assignments improve perf of lookups on DOM nodes
			// @ts-expect-error
			element_prototype.__click = undefined;
			// @ts-expect-error
			element_prototype.__className = undefined;
			// @ts-expect-error
			element_prototype.__attributes = null;
			// @ts-expect-error
			element_prototype.__style = undefined;
			// @ts-expect-error
			element_prototype.__e = undefined;
		}

		if (is_extensible(text_prototype)) {
			// @ts-expect-error
			text_prototype.__t = undefined;
		}
	}

	/**
	 * @param {string} value
	 * @returns {Text}
	 */
	function create_text(value = '') {
		return document.createTextNode(value);
	}

	/**
	 * @template {Node} N
	 * @param {N} node
	 */
	/*@__NO_SIDE_EFFECTS__*/
	function get_first_child(node) {
		return /** @type {TemplateNode | null} */ (first_child_getter.call(node));
	}

	/**
	 * @template {Node} N
	 * @param {N} node
	 */
	/*@__NO_SIDE_EFFECTS__*/
	function get_next_sibling(node) {
		return /** @type {TemplateNode | null} */ (next_sibling_getter.call(node));
	}

	/**
	 * Don't mark this as side-effect-free, hydration needs to walk all nodes
	 * @template {Node} N
	 * @param {N} node
	 * @param {boolean} is_text
	 * @returns {TemplateNode | null}
	 */
	function child(node, is_text) {
		if (!hydrating) {
			return get_first_child(node);
		}

		var child = get_first_child(hydrate_node);

		// Child can be null if we have an element with a single child, like `<p>{text}</p>`, where `text` is empty
		if (child === null) {
			child = hydrate_node.appendChild(create_text());
		} else if (is_text && child.nodeType !== TEXT_NODE) {
			var text = create_text();
			child?.before(text);
			set_hydrate_node(text);
			return text;
		}

		set_hydrate_node(child);
		return child;
	}

	/**
	 * Don't mark this as side-effect-free, hydration needs to walk all nodes
	 * @param {TemplateNode} node
	 * @param {boolean} [is_text]
	 * @returns {TemplateNode | null}
	 */
	function first_child(node, is_text = false) {
		if (!hydrating) {
			var first = get_first_child(node);

			// TODO prevent user comments with the empty string when preserveComments is true
			if (first instanceof Comment && first.data === '') return get_next_sibling(first);

			return first;
		}

		// if an {expression} is empty during SSR, there might be no
		// text node to hydrate — we must therefore create one
		if (is_text && hydrate_node?.nodeType !== TEXT_NODE) {
			var text = create_text();

			hydrate_node?.before(text);
			set_hydrate_node(text);
			return text;
		}

		return hydrate_node;
	}

	/**
	 * Don't mark this as side-effect-free, hydration needs to walk all nodes
	 * @param {TemplateNode} node
	 * @param {number} count
	 * @param {boolean} is_text
	 * @returns {TemplateNode | null}
	 */
	function sibling(node, count = 1, is_text = false) {
		let next_sibling = hydrating ? hydrate_node : node;
		var last_sibling;

		while (count--) {
			last_sibling = next_sibling;
			next_sibling = /** @type {TemplateNode} */ (get_next_sibling(next_sibling));
		}

		if (!hydrating) {
			return next_sibling;
		}

		// if a sibling {expression} is empty during SSR, there might be no
		// text node to hydrate — we must therefore create one
		if (is_text && next_sibling?.nodeType !== TEXT_NODE) {
			var text = create_text();
			// If the next sibling is `null` and we're handling text then it's because
			// the SSR content was empty for the text, so we need to generate a new text
			// node and insert it after the last sibling
			if (next_sibling === null) {
				last_sibling?.after(text);
			} else {
				next_sibling.before(text);
			}
			set_hydrate_node(text);
			return text;
		}

		set_hydrate_node(next_sibling);
		return next_sibling;
	}

	/**
	 * @template {Node} N
	 * @param {N} node
	 * @returns {void}
	 */
	function clear_text_content(node) {
		node.textContent = '';
	}

	/**
	 * Returns `true` if we're updating the current block, for example `condition` in
	 * an `{#if condition}` block just changed. In this case, the branch should be
	 * appended (or removed) at the same time as other updates within the
	 * current `<svelte:boundary>`
	 */
	function should_defer_append() {
		return false;
	}

	let listening_to_form_reset = false;

	function add_form_reset_listener() {
		if (!listening_to_form_reset) {
			listening_to_form_reset = true;
			document.addEventListener(
				'reset',
				(evt) => {
					// Needs to happen one tick later or else the dom properties of the form
					// elements have not updated to their reset values yet
					Promise.resolve().then(() => {
						if (!evt.defaultPrevented) {
							for (const e of /**@type {HTMLFormElement} */ (evt.target).elements) {
								// @ts-expect-error
								e.__on_r?.();
							}
						}
					});
				},
				// In the capture phase to guarantee we get noticed of it (no possibility of stopPropagation)
				{ capture: true }
			);
		}
	}

	/**
	 * @template T
	 * @param {() => T} fn
	 */
	function without_reactive_context(fn) {
		var previous_reaction = active_reaction;
		var previous_effect = active_effect;
		set_active_reaction(null);
		set_active_effect(null);
		try {
			return fn();
		} finally {
			set_active_reaction(previous_reaction);
			set_active_effect(previous_effect);
		}
	}

	/**
	 * Listen to the given event, and then instantiate a global form reset listener if not already done,
	 * to notify all bindings when the form is reset
	 * @param {HTMLElement} element
	 * @param {string} event
	 * @param {(is_reset?: true) => void} handler
	 * @param {(is_reset?: true) => void} [on_reset]
	 */
	function listen_to_event_and_reset_event(element, event, handler, on_reset = handler) {
		element.addEventListener(event, () => without_reactive_context(handler));
		// @ts-expect-error
		const prev = element.__on_r;
		if (prev) {
			// special case for checkbox that can have multiple binds (group & checked)
			// @ts-expect-error
			element.__on_r = () => {
				prev();
				on_reset(true);
			};
		} else {
			// @ts-expect-error
			element.__on_r = () => on_reset(true);
		}

		add_form_reset_listener();
	}

	/** @import { ComponentContext, ComponentContextLegacy, Derived, Effect, TemplateNode, TransitionManager } from '#client' */

	/**
	 * @param {'$effect' | '$effect.pre' | '$inspect'} rune
	 */
	function validate_effect(rune) {
		if (active_effect === null) {
			if (active_reaction === null) {
				effect_orphan();
			}

			effect_in_unowned_derived();
		}

		if (is_destroying_effect) {
			effect_in_teardown();
		}
	}

	/**
	 * @param {Effect} effect
	 * @param {Effect} parent_effect
	 */
	function push_effect(effect, parent_effect) {
		var parent_last = parent_effect.last;
		if (parent_last === null) {
			parent_effect.last = parent_effect.first = effect;
		} else {
			parent_last.next = effect;
			effect.prev = parent_last;
			parent_effect.last = effect;
		}
	}

	/**
	 * @param {number} type
	 * @param {null | (() => void | (() => void))} fn
	 * @param {boolean} sync
	 * @returns {Effect}
	 */
	function create_effect(type, fn, sync) {
		var parent = active_effect;

		if (parent !== null && (parent.f & INERT) !== 0) {
			type |= INERT;
		}

		/** @type {Effect} */
		var effect = {
			ctx: component_context,
			deps: null,
			nodes: null,
			f: type | DIRTY | CONNECTED,
			first: null,
			fn,
			last: null,
			next: null,
			parent,
			b: parent && parent.b,
			prev: null,
			teardown: null,
			wv: 0,
			ac: null
		};

		if (sync) {
			try {
				update_effect(effect);
				effect.f |= EFFECT_RAN;
			} catch (e) {
				destroy_effect(effect);
				throw e;
			}
		} else if (fn !== null) {
			schedule_effect(effect);
		}

		/** @type {Effect | null} */
		var e = effect;

		// if an effect has already ran and doesn't need to be kept in the tree
		// (because it won't re-run, has no DOM, and has no teardown etc)
		// then we skip it and go to its child (if any)
		if (
			sync &&
			e.deps === null &&
			e.teardown === null &&
			e.nodes === null &&
			e.first === e.last && // either `null`, or a singular child
			(e.f & EFFECT_PRESERVED) === 0
		) {
			e = e.first;
			if ((type & BLOCK_EFFECT) !== 0 && (type & EFFECT_TRANSPARENT) !== 0 && e !== null) {
				e.f |= EFFECT_TRANSPARENT;
			}
		}

		if (e !== null) {
			e.parent = parent;

			if (parent !== null) {
				push_effect(e, parent);
			}

			// if we're in a derived, add the effect there too
			if (
				active_reaction !== null &&
				(active_reaction.f & DERIVED) !== 0 &&
				(type & ROOT_EFFECT) === 0
			) {
				var derived = /** @type {Derived} */ (active_reaction);
				(derived.effects ??= []).push(e);
			}
		}

		return effect;
	}

	/**
	 * Internal representation of `$effect.tracking()`
	 * @returns {boolean}
	 */
	function effect_tracking() {
		return active_reaction !== null && !untracking;
	}

	/**
	 * @param {() => void} fn
	 */
	function teardown(fn) {
		const effect = create_effect(RENDER_EFFECT, null, false);
		set_signal_status(effect, CLEAN);
		effect.teardown = fn;
		return effect;
	}

	/**
	 * Internal representation of `$effect(...)`
	 * @param {() => void | (() => void)} fn
	 */
	function user_effect(fn) {
		validate_effect();

		// Non-nested `$effect(...)` in a component should be deferred
		// until the component is mounted
		var flags = /** @type {Effect} */ (active_effect).f;
		var defer = !active_reaction && (flags & BRANCH_EFFECT) !== 0 && (flags & EFFECT_RAN) === 0;

		if (defer) {
			// Top-level `$effect(...)` in an unmounted component — defer until mount
			var context = /** @type {ComponentContext} */ (component_context);
			(context.e ??= []).push(fn);
		} else {
			// Everything else — create immediately
			return create_user_effect(fn);
		}
	}

	/**
	 * @param {() => void | (() => void)} fn
	 */
	function create_user_effect(fn) {
		return create_effect(EFFECT | USER_EFFECT, fn, false);
	}

	/**
	 * Internal representation of `$effect.pre(...)`
	 * @param {() => void | (() => void)} fn
	 * @returns {Effect}
	 */
	function user_pre_effect(fn) {
		validate_effect();
		return create_effect(RENDER_EFFECT | USER_EFFECT, fn, true);
	}

	/**
	 * Internal representation of `$effect.root(...)`
	 * @param {() => void | (() => void)} fn
	 * @returns {() => void}
	 */
	function effect_root(fn) {
		Batch.ensure();
		const effect = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn, true);

		return () => {
			destroy_effect(effect);
		};
	}

	/**
	 * An effect root whose children can transition out
	 * @param {() => void} fn
	 * @returns {(options?: { outro?: boolean }) => Promise<void>}
	 */
	function component_root(fn) {
		Batch.ensure();
		const effect = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn, true);

		return (options = {}) => {
			return new Promise((fulfil) => {
				if (options.outro) {
					pause_effect(effect, () => {
						destroy_effect(effect);
						fulfil(undefined);
					});
				} else {
					destroy_effect(effect);
					fulfil(undefined);
				}
			});
		};
	}

	/**
	 * @param {() => void | (() => void)} fn
	 * @returns {Effect}
	 */
	function effect(fn) {
		return create_effect(EFFECT, fn, false);
	}

	/**
	 * @param {() => void | (() => void)} fn
	 * @returns {Effect}
	 */
	function async_effect(fn) {
		return create_effect(ASYNC | EFFECT_PRESERVED, fn, true);
	}

	/**
	 * @param {() => void | (() => void)} fn
	 * @returns {Effect}
	 */
	function render_effect(fn, flags = 0) {
		return create_effect(RENDER_EFFECT | flags, fn, true);
	}

	/**
	 * @param {(...expressions: any) => void | (() => void)} fn
	 * @param {Array<() => any>} sync
	 * @param {Array<() => Promise<any>>} async
	 * @param {Array<Promise<void>>} blockers
	 */
	function template_effect(fn, sync = [], async = [], blockers = []) {
		flatten(blockers, sync, async, (values) => {
			create_effect(RENDER_EFFECT, () => fn(...values.map(get)), true);
		});
	}

	/**
	 * @param {(() => void)} fn
	 * @param {number} flags
	 */
	function block(fn, flags = 0) {
		var effect = create_effect(BLOCK_EFFECT | flags, fn, true);
		return effect;
	}

	/**
	 * @param {(() => void)} fn
	 */
	function branch(fn) {
		return create_effect(BRANCH_EFFECT | EFFECT_PRESERVED, fn, true);
	}

	/**
	 * @param {Effect} effect
	 */
	function execute_effect_teardown(effect) {
		var teardown = effect.teardown;
		if (teardown !== null) {
			const previously_destroying_effect = is_destroying_effect;
			const previous_reaction = active_reaction;
			set_is_destroying_effect(true);
			set_active_reaction(null);
			try {
				teardown.call(null);
			} finally {
				set_is_destroying_effect(previously_destroying_effect);
				set_active_reaction(previous_reaction);
			}
		}
	}

	/**
	 * @param {Effect} signal
	 * @param {boolean} remove_dom
	 * @returns {void}
	 */
	function destroy_effect_children(signal, remove_dom = false) {
		var effect = signal.first;
		signal.first = signal.last = null;

		while (effect !== null) {
			const controller = effect.ac;

			if (controller !== null) {
				without_reactive_context(() => {
					controller.abort(STALE_REACTION);
				});
			}

			var next = effect.next;

			if ((effect.f & ROOT_EFFECT) !== 0) {
				// this is now an independent root
				effect.parent = null;
			} else {
				destroy_effect(effect, remove_dom);
			}

			effect = next;
		}
	}

	/**
	 * @param {Effect} signal
	 * @returns {void}
	 */
	function destroy_block_effect_children(signal) {
		var effect = signal.first;

		while (effect !== null) {
			var next = effect.next;
			if ((effect.f & BRANCH_EFFECT) === 0) {
				destroy_effect(effect);
			}
			effect = next;
		}
	}

	/**
	 * @param {Effect} effect
	 * @param {boolean} [remove_dom]
	 * @returns {void}
	 */
	function destroy_effect(effect, remove_dom = true) {
		var removed = false;

		if (
			(remove_dom || (effect.f & HEAD_EFFECT) !== 0) &&
			effect.nodes !== null &&
			effect.nodes.end !== null
		) {
			remove_effect_dom(effect.nodes.start, /** @type {TemplateNode} */ (effect.nodes.end));
			removed = true;
		}

		destroy_effect_children(effect, remove_dom && !removed);
		remove_reactions(effect, 0);
		set_signal_status(effect, DESTROYED);

		var transitions = effect.nodes && effect.nodes.t;

		if (transitions !== null) {
			for (const transition of transitions) {
				transition.stop();
			}
		}

		execute_effect_teardown(effect);

		var parent = effect.parent;

		// If the parent doesn't have any children, then skip this work altogether
		if (parent !== null && parent.first !== null) {
			unlink_effect(effect);
		}

		// `first` and `child` are nulled out in destroy_effect_children
		// we don't null out `parent` so that error propagation can work correctly
		effect.next =
			effect.prev =
			effect.teardown =
			effect.ctx =
			effect.deps =
			effect.fn =
			effect.nodes =
			effect.ac =
				null;
	}

	/**
	 *
	 * @param {TemplateNode | null} node
	 * @param {TemplateNode} end
	 */
	function remove_effect_dom(node, end) {
		while (node !== null) {
			/** @type {TemplateNode | null} */
			var next = node === end ? null : get_next_sibling(node);

			node.remove();
			node = next;
		}
	}

	/**
	 * Detach an effect from the effect tree, freeing up memory and
	 * reducing the amount of work that happens on subsequent traversals
	 * @param {Effect} effect
	 */
	function unlink_effect(effect) {
		var parent = effect.parent;
		var prev = effect.prev;
		var next = effect.next;

		if (prev !== null) prev.next = next;
		if (next !== null) next.prev = prev;

		if (parent !== null) {
			if (parent.first === effect) parent.first = next;
			if (parent.last === effect) parent.last = prev;
		}
	}

	/**
	 * When a block effect is removed, we don't immediately destroy it or yank it
	 * out of the DOM, because it might have transitions. Instead, we 'pause' it.
	 * It stays around (in memory, and in the DOM) until outro transitions have
	 * completed, and if the state change is reversed then we _resume_ it.
	 * A paused effect does not update, and the DOM subtree becomes inert.
	 * @param {Effect} effect
	 * @param {() => void} [callback]
	 * @param {boolean} [destroy]
	 */
	function pause_effect(effect, callback, destroy = true) {
		/** @type {TransitionManager[]} */
		var transitions = [];

		pause_children(effect, transitions, true);

		var fn = () => {
			if (destroy) destroy_effect(effect);
			if (callback) callback();
		};

		var remaining = transitions.length;
		if (remaining > 0) {
			var check = () => --remaining || fn();
			for (var transition of transitions) {
				transition.out(check);
			}
		} else {
			fn();
		}
	}

	/**
	 * @param {Effect} effect
	 * @param {TransitionManager[]} transitions
	 * @param {boolean} local
	 */
	function pause_children(effect, transitions, local) {
		if ((effect.f & INERT) !== 0) return;
		effect.f ^= INERT;

		var t = effect.nodes && effect.nodes.t;

		if (t !== null) {
			for (const transition of t) {
				if (transition.is_global || local) {
					transitions.push(transition);
				}
			}
		}

		var child = effect.first;

		while (child !== null) {
			var sibling = child.next;
			var transparent =
				(child.f & EFFECT_TRANSPARENT) !== 0 ||
				// If this is a branch effect without a block effect parent,
				// it means the parent block effect was pruned. In that case,
				// transparency information was transferred to the branch effect.
				((child.f & BRANCH_EFFECT) !== 0 && (effect.f & BLOCK_EFFECT) !== 0);
			// TODO we don't need to call pause_children recursively with a linked list in place
			// it's slightly more involved though as we have to account for `transparent` changing
			// through the tree.
			pause_children(child, transitions, transparent ? local : false);
			child = sibling;
		}
	}

	/**
	 * The opposite of `pause_effect`. We call this if (for example)
	 * `x` becomes falsy then truthy: `{#if x}...{/if}`
	 * @param {Effect} effect
	 */
	function resume_effect(effect) {
		resume_children(effect, true);
	}

	/**
	 * @param {Effect} effect
	 * @param {boolean} local
	 */
	function resume_children(effect, local) {
		if ((effect.f & INERT) === 0) return;
		effect.f ^= INERT;

		// If a dependency of this effect changed while it was paused,
		// schedule the effect to update. we don't use `is_dirty`
		// here because we don't want to eagerly recompute a derived like
		// `{#if foo}{foo.bar()}{/if}` if `foo` is now `undefined
		if ((effect.f & CLEAN) === 0) {
			set_signal_status(effect, DIRTY);
			schedule_effect(effect);
		}

		var child = effect.first;

		while (child !== null) {
			var sibling = child.next;
			var transparent = (child.f & EFFECT_TRANSPARENT) !== 0 || (child.f & BRANCH_EFFECT) !== 0;
			// TODO we don't need to call resume_children recursively with a linked list in place
			// it's slightly more involved though as we have to account for `transparent` changing
			// through the tree.
			resume_children(child, transparent ? local : false);
			child = sibling;
		}

		var t = effect.nodes && effect.nodes.t;

		if (t !== null) {
			for (const transition of t) {
				if (transition.is_global || local) {
					transition.in();
				}
			}
		}
	}

	/**
	 * @param {Effect} effect
	 * @param {DocumentFragment} fragment
	 */
	function move_effect(effect, fragment) {
		if (!effect.nodes) return;

		/** @type {TemplateNode | null} */
		var node = effect.nodes.start;
		var end = effect.nodes.end;

		while (node !== null) {
			/** @type {TemplateNode | null} */
			var next = node === end ? null : get_next_sibling(node);

			fragment.append(node);
			node = next;
		}
	}

	/** @import { Derived, Effect, Reaction, Signal, Source, Value } from '#client' */

	let is_updating_effect = false;

	/** @param {boolean} value */
	function set_is_updating_effect(value) {
		is_updating_effect = value;
	}

	let is_destroying_effect = false;

	/** @param {boolean} value */
	function set_is_destroying_effect(value) {
		is_destroying_effect = value;
	}

	/** @type {null | Reaction} */
	let active_reaction = null;

	let untracking = false;

	/** @param {null | Reaction} reaction */
	function set_active_reaction(reaction) {
		active_reaction = reaction;
	}

	/** @type {null | Effect} */
	let active_effect = null;

	/** @param {null | Effect} effect */
	function set_active_effect(effect) {
		active_effect = effect;
	}

	/**
	 * When sources are created within a reaction, reading and writing
	 * them within that reaction should not cause a re-run
	 * @type {null | Source[]}
	 */
	let current_sources = null;

	/** @param {Value} value */
	function push_reaction_value(value) {
		if (active_reaction !== null && (true)) {
			if (current_sources === null) {
				current_sources = [value];
			} else {
				current_sources.push(value);
			}
		}
	}

	/**
	 * The dependencies of the reaction that is currently being executed. In many cases,
	 * the dependencies are unchanged between runs, and so this will be `null` unless
	 * and until a new dependency is accessed — we track this via `skipped_deps`
	 * @type {null | Value[]}
	 */
	let new_deps = null;

	let skipped_deps = 0;

	/**
	 * Tracks writes that the effect it's executed in doesn't listen to yet,
	 * so that the dependency can be added to the effect later on if it then reads it
	 * @type {null | Source[]}
	 */
	let untracked_writes = null;

	/** @param {null | Source[]} value */
	function set_untracked_writes(value) {
		untracked_writes = value;
	}

	/**
	 * @type {number} Used by sources and deriveds for handling updates.
	 * Version starts from 1 so that unowned deriveds differentiate between a created effect and a run one for tracing
	 **/
	let write_version = 1;

	/** @type {number} Used to version each read of a source of derived to avoid duplicating depedencies inside a reaction */
	let read_version = 0;

	let update_version = read_version;

	/** @param {number} value */
	function set_update_version(value) {
		update_version = value;
	}

	function increment_write_version() {
		return ++write_version;
	}

	/**
	 * Determines whether a derived or effect is dirty.
	 * If it is MAYBE_DIRTY, will set the status to CLEAN
	 * @param {Reaction} reaction
	 * @returns {boolean}
	 */
	function is_dirty(reaction) {
		var flags = reaction.f;

		if ((flags & DIRTY) !== 0) {
			return true;
		}

		if (flags & DERIVED) {
			reaction.f &= ~WAS_MARKED;
		}

		if ((flags & MAYBE_DIRTY) !== 0) {
			var dependencies = reaction.deps;

			if (dependencies !== null) {
				var length = dependencies.length;

				for (var i = 0; i < length; i++) {
					var dependency = dependencies[i];

					if (is_dirty(/** @type {Derived} */ (dependency))) {
						update_derived(/** @type {Derived} */ (dependency));
					}

					if (dependency.wv > reaction.wv) {
						return true;
					}
				}
			}

			if (
				(flags & CONNECTED) !== 0 &&
				// During time traveling we don't want to reset the status so that
				// traversal of the graph in the other batches still happens
				batch_values === null
			) {
				set_signal_status(reaction, CLEAN);
			}
		}

		return false;
	}

	/**
	 * @param {Value} signal
	 * @param {Effect} effect
	 * @param {boolean} [root]
	 */
	function schedule_possible_effect_self_invalidation(signal, effect, root = true) {
		var reactions = signal.reactions;
		if (reactions === null) return;

		if (current_sources?.includes(signal)) {
			return;
		}

		for (var i = 0; i < reactions.length; i++) {
			var reaction = reactions[i];

			if ((reaction.f & DERIVED) !== 0) {
				schedule_possible_effect_self_invalidation(/** @type {Derived} */ (reaction), effect, false);
			} else if (effect === reaction) {
				if (root) {
					set_signal_status(reaction, DIRTY);
				} else if ((reaction.f & CLEAN) !== 0) {
					set_signal_status(reaction, MAYBE_DIRTY);
				}
				schedule_effect(/** @type {Effect} */ (reaction));
			}
		}
	}

	/** @param {Reaction} reaction */
	function update_reaction(reaction) {
		var previous_deps = new_deps;
		var previous_skipped_deps = skipped_deps;
		var previous_untracked_writes = untracked_writes;
		var previous_reaction = active_reaction;
		var previous_sources = current_sources;
		var previous_component_context = component_context;
		var previous_untracking = untracking;
		var previous_update_version = update_version;

		var flags = reaction.f;

		new_deps = /** @type {null | Value[]} */ (null);
		skipped_deps = 0;
		untracked_writes = null;
		active_reaction = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;

		current_sources = null;
		set_component_context(reaction.ctx);
		untracking = false;
		update_version = ++read_version;

		if (reaction.ac !== null) {
			without_reactive_context(() => {
				/** @type {AbortController} */ (reaction.ac).abort(STALE_REACTION);
			});

			reaction.ac = null;
		}

		try {
			reaction.f |= REACTION_IS_UPDATING;
			var fn = /** @type {Function} */ (reaction.fn);
			var result = fn();
			var deps = reaction.deps;

			if (new_deps !== null) {
				var i;

				remove_reactions(reaction, skipped_deps);

				if (deps !== null && skipped_deps > 0) {
					deps.length = skipped_deps + new_deps.length;
					for (i = 0; i < new_deps.length; i++) {
						deps[skipped_deps + i] = new_deps[i];
					}
				} else {
					reaction.deps = deps = new_deps;
				}

				if (effect_tracking() && (reaction.f & CONNECTED) !== 0) {
					for (i = skipped_deps; i < deps.length; i++) {
						(deps[i].reactions ??= []).push(reaction);
					}
				}
			} else if (deps !== null && skipped_deps < deps.length) {
				remove_reactions(reaction, skipped_deps);
				deps.length = skipped_deps;
			}

			// If we're inside an effect and we have untracked writes, then we need to
			// ensure that if any of those untracked writes result in re-invalidation
			// of the current effect, then that happens accordingly
			if (
				is_runes() &&
				untracked_writes !== null &&
				!untracking &&
				deps !== null &&
				(reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0
			) {
				for (i = 0; i < /** @type {Source[]} */ (untracked_writes).length; i++) {
					schedule_possible_effect_self_invalidation(
						untracked_writes[i],
						/** @type {Effect} */ (reaction)
					);
				}
			}

			// If we are returning to an previous reaction then
			// we need to increment the read version to ensure that
			// any dependencies in this reaction aren't marked with
			// the same version
			if (previous_reaction !== null && previous_reaction !== reaction) {
				read_version++;

				if (untracked_writes !== null) {
					if (previous_untracked_writes === null) {
						previous_untracked_writes = untracked_writes;
					} else {
						previous_untracked_writes.push(.../** @type {Source[]} */ (untracked_writes));
					}
				}
			}

			if ((reaction.f & ERROR_VALUE) !== 0) {
				reaction.f ^= ERROR_VALUE;
			}

			return result;
		} catch (error) {
			return handle_error(error);
		} finally {
			reaction.f ^= REACTION_IS_UPDATING;
			new_deps = previous_deps;
			skipped_deps = previous_skipped_deps;
			untracked_writes = previous_untracked_writes;
			active_reaction = previous_reaction;
			current_sources = previous_sources;
			set_component_context(previous_component_context);
			untracking = previous_untracking;
			update_version = previous_update_version;
		}
	}

	/**
	 * @template V
	 * @param {Reaction} signal
	 * @param {Value<V>} dependency
	 * @returns {void}
	 */
	function remove_reaction(signal, dependency) {
		let reactions = dependency.reactions;
		if (reactions !== null) {
			var index = index_of.call(reactions, signal);
			if (index !== -1) {
				var new_length = reactions.length - 1;
				if (new_length === 0) {
					reactions = dependency.reactions = null;
				} else {
					// Swap with last element and then remove.
					reactions[index] = reactions[new_length];
					reactions.pop();
				}
			}
		}

		// If the derived has no reactions, then we can disconnect it from the graph,
		// allowing it to either reconnect in the future, or be GC'd by the VM.
		if (
			reactions === null &&
			(dependency.f & DERIVED) !== 0 &&
			// Destroying a child effect while updating a parent effect can cause a dependency to appear
			// to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
			// allows us to skip the expensive work of disconnecting and immediately reconnecting it
			(new_deps === null || !new_deps.includes(dependency))
		) {
			set_signal_status(dependency, MAYBE_DIRTY);
			// If we are working with a derived that is owned by an effect, then mark it as being
			// disconnected and remove the mark flag, as it cannot be reliably removed otherwise
			if ((dependency.f & CONNECTED) !== 0) {
				dependency.f ^= CONNECTED;
				dependency.f &= ~WAS_MARKED;
			}
			// Disconnect any reactions owned by this reaction
			destroy_derived_effects(/** @type {Derived} **/ (dependency));
			remove_reactions(/** @type {Derived} **/ (dependency), 0);
		}
	}

	/**
	 * @param {Reaction} signal
	 * @param {number} start_index
	 * @returns {void}
	 */
	function remove_reactions(signal, start_index) {
		var dependencies = signal.deps;
		if (dependencies === null) return;

		for (var i = start_index; i < dependencies.length; i++) {
			remove_reaction(signal, dependencies[i]);
		}
	}

	/**
	 * @param {Effect} effect
	 * @returns {void}
	 */
	function update_effect(effect) {
		var flags = effect.f;

		if ((flags & DESTROYED) !== 0) {
			return;
		}

		set_signal_status(effect, CLEAN);

		var previous_effect = active_effect;
		var was_updating_effect = is_updating_effect;

		active_effect = effect;
		is_updating_effect = true;

		try {
			if ((flags & (BLOCK_EFFECT | MANAGED_EFFECT)) !== 0) {
				destroy_block_effect_children(effect);
			} else {
				destroy_effect_children(effect);
			}

			execute_effect_teardown(effect);
			var teardown = update_reaction(effect);
			effect.teardown = typeof teardown === 'function' ? teardown : null;
			effect.wv = write_version;

			// In DEV, increment versions of any sources that were written to during the effect,
			// so that they are correctly marked as dirty when the effect re-runs
			var dep; if (DEV && tracing_mode_flag && (effect.f & DIRTY) !== 0 && effect.deps !== null) ;
		} finally {
			is_updating_effect = was_updating_effect;
			active_effect = previous_effect;
		}
	}

	/**
	 * @template V
	 * @param {Value<V>} signal
	 * @returns {V}
	 */
	function get(signal) {
		var flags = signal.f;
		var is_derived = (flags & DERIVED) !== 0;

		// Register the dependency on the current reaction signal.
		if (active_reaction !== null && !untracking) {
			// if we're in a derived that is being read inside an _async_ derived,
			// it's possible that the effect was already destroyed. In this case,
			// we don't add the dependency, because that would create a memory leak
			var destroyed = active_effect !== null && (active_effect.f & DESTROYED) !== 0;

			if (!destroyed && !current_sources?.includes(signal)) {
				var deps = active_reaction.deps;

				if ((active_reaction.f & REACTION_IS_UPDATING) !== 0) {
					// we're in the effect init/update cycle
					if (signal.rv < read_version) {
						signal.rv = read_version;

						// If the signal is accessing the same dependencies in the same
						// order as it did last time, increment `skipped_deps`
						// rather than updating `new_deps`, which creates GC cost
						if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
							skipped_deps++;
						} else if (new_deps === null) {
							new_deps = [signal];
						} else if (!new_deps.includes(signal)) {
							new_deps.push(signal);
						}
					}
				} else {
					// we're adding a dependency outside the init/update cycle
					// (i.e. after an `await`)
					(active_reaction.deps ??= []).push(signal);

					var reactions = signal.reactions;

					if (reactions === null) {
						signal.reactions = [active_reaction];
					} else if (!reactions.includes(active_reaction)) {
						reactions.push(active_reaction);
					}
				}
			}
		}

		if (is_destroying_effect) {
			if (old_values.has(signal)) {
				return old_values.get(signal);
			}

			if (is_derived) {
				var derived = /** @type {Derived} */ (signal);

				var value = derived.v;

				// if the derived is dirty and has reactions, or depends on the values that just changed, re-execute
				// (a derived can be maybe_dirty due to the effect destroy removing its last reaction)
				if (
					((derived.f & CLEAN) === 0 && derived.reactions !== null) ||
					depends_on_old_values(derived)
				) {
					value = execute_derived(derived);
				}

				old_values.set(derived, value);

				return value;
			}
		} else if (
			is_derived &&
			(!batch_values?.has(signal) || (current_batch?.is_fork && !effect_tracking()))
		) {
			derived = /** @type {Derived} */ (signal);

			if (is_dirty(derived)) {
				update_derived(derived);
			}

			if (is_updating_effect && effect_tracking() && (derived.f & CONNECTED) === 0) {
				reconnect(derived);
			}
		}

		if (batch_values?.has(signal)) {
			return batch_values.get(signal);
		}

		if ((signal.f & ERROR_VALUE) !== 0) {
			throw signal.v;
		}

		return signal.v;
	}

	/**
	 * (Re)connect a disconnected derived, so that it is notified
	 * of changes in `mark_reactions`
	 * @param {Derived} derived
	 */
	function reconnect(derived) {
		if (derived.deps === null) return;

		derived.f ^= CONNECTED;

		for (const dep of derived.deps) {
			(dep.reactions ??= []).push(derived);

			if ((dep.f & DERIVED) !== 0 && (dep.f & CONNECTED) === 0) {
				reconnect(/** @type {Derived} */ (dep));
			}
		}
	}

	/** @param {Derived} derived */
	function depends_on_old_values(derived) {
		if (derived.v === UNINITIALIZED) return true; // we don't know, so assume the worst
		if (derived.deps === null) return false;

		for (const dep of derived.deps) {
			if (old_values.has(dep)) {
				return true;
			}

			if ((dep.f & DERIVED) !== 0 && depends_on_old_values(/** @type {Derived} */ (dep))) {
				return true;
			}
		}

		return false;
	}

	/**
	 * When used inside a [`$derived`](https://svelte.dev/docs/svelte/$derived) or [`$effect`](https://svelte.dev/docs/svelte/$effect),
	 * any state read inside `fn` will not be treated as a dependency.
	 *
	 * ```ts
	 * $effect(() => {
	 *   // this will run when `data` changes, but not when `time` changes
	 *   save(data, {
	 *     timestamp: untrack(() => time)
	 *   });
	 * });
	 * ```
	 * @template T
	 * @param {() => T} fn
	 * @returns {T}
	 */
	function untrack(fn) {
		var previous_untracking = untracking;
		try {
			untracking = true;
			return fn();
		} finally {
			untracking = previous_untracking;
		}
	}

	const STATUS_MASK = -7169;

	/**
	 * @param {Signal} signal
	 * @param {number} status
	 * @returns {void}
	 */
	function set_signal_status(signal, status) {
		signal.f = (signal.f & STATUS_MASK) | status;
	}

	/**
	 * Possibly traverse an object and read all its properties so that they're all reactive in case this is `$state`.
	 * Does only check first level of an object for performance reasons (heuristic should be good for 99% of all cases).
	 * @param {any} value
	 * @returns {void}
	 */
	function deep_read_state(value) {
		if (typeof value !== 'object' || !value || value instanceof EventTarget) {
			return;
		}

		if (STATE_SYMBOL in value) {
			deep_read(value);
		} else if (!Array.isArray(value)) {
			for (let key in value) {
				const prop = value[key];
				if (typeof prop === 'object' && prop && STATE_SYMBOL in prop) {
					deep_read(prop);
				}
			}
		}
	}

	/**
	 * Deeply traverse an object and read all its properties
	 * so that they're all reactive in case this is `$state`
	 * @param {any} value
	 * @param {Set<any>} visited
	 * @returns {void}
	 */
	function deep_read(value, visited = new Set()) {
		if (
			typeof value === 'object' &&
			value !== null &&
			// We don't want to traverse DOM elements
			!(value instanceof EventTarget) &&
			!visited.has(value)
		) {
			visited.add(value);
			// When working with a possible SvelteDate, this
			// will ensure we capture changes to it.
			if (value instanceof Date) {
				value.getTime();
			}
			for (let key in value) {
				try {
					deep_read(value[key], visited);
				} catch (e) {
					// continue
				}
			}
			const proto = get_prototype_of(value);
			if (
				proto !== Object.prototype &&
				proto !== Array.prototype &&
				proto !== Map.prototype &&
				proto !== Set.prototype &&
				proto !== Date.prototype
			) {
				const descriptors = get_descriptors(proto);
				for (let key in descriptors) {
					const get = descriptors[key].get;
					if (get) {
						try {
							get.call(value);
						} catch (e) {
							// continue
						}
					}
				}
			}
		}
	}

	/** @type {Set<string>} */
	const all_registered_events = new Set();

	/** @type {Set<(events: Array<string>) => void>} */
	const root_event_handles = new Set();

	/**
	 * @param {string} event_name
	 * @param {EventTarget} dom
	 * @param {EventListener} [handler]
	 * @param {AddEventListenerOptions} [options]
	 */
	function create_event(event_name, dom, handler, options = {}) {
		/**
		 * @this {EventTarget}
		 */
		function target_handler(/** @type {Event} */ event) {
			if (!options.capture) {
				// Only call in the bubble phase, else delegated events would be called before the capturing events
				handle_event_propagation.call(dom, event);
			}
			if (!event.cancelBubble) {
				return without_reactive_context(() => {
					return handler?.call(this, event);
				});
			}
		}

		// Chrome has a bug where pointer events don't work when attached to a DOM element that has been cloned
		// with cloneNode() and the DOM element is disconnected from the document. To ensure the event works, we
		// defer the attachment till after it's been appended to the document. TODO: remove this once Chrome fixes
		// this bug. The same applies to wheel events and touch events.
		if (
			event_name.startsWith('pointer') ||
			event_name.startsWith('touch') ||
			event_name === 'wheel'
		) {
			queue_micro_task(() => {
				dom.addEventListener(event_name, target_handler, options);
			});
		} else {
			dom.addEventListener(event_name, target_handler, options);
		}

		return target_handler;
	}

	/**
	 * @param {string} event_name
	 * @param {Element} dom
	 * @param {EventListener} [handler]
	 * @param {boolean} [capture]
	 * @param {boolean} [passive]
	 * @returns {void}
	 */
	function event(event_name, dom, handler, capture, passive) {
		var options = { capture, passive };
		var target_handler = create_event(event_name, dom, handler, options);

		if (
			dom === document.body ||
			// @ts-ignore
			dom === window ||
			// @ts-ignore
			dom === document ||
			// Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
			dom instanceof HTMLMediaElement
		) {
			teardown(() => {
				dom.removeEventListener(event_name, target_handler, options);
			});
		}
	}

	/**
	 * @param {Array<string>} events
	 * @returns {void}
	 */
	function delegate(events) {
		for (var i = 0; i < events.length; i++) {
			all_registered_events.add(events[i]);
		}

		for (var fn of root_event_handles) {
			fn(events);
		}
	}

	// used to store the reference to the currently propagated event
	// to prevent garbage collection between microtasks in Firefox
	// If the event object is GCed too early, the expando __root property
	// set on the event object is lost, causing the event delegation
	// to process the event twice
	let last_propagated_event = null;

	/**
	 * @this {EventTarget}
	 * @param {Event} event
	 * @returns {void}
	 */
	function handle_event_propagation(event) {
		var handler_element = this;
		var owner_document = /** @type {Node} */ (handler_element).ownerDocument;
		var event_name = event.type;
		var path = event.composedPath?.() || [];
		var current_target = /** @type {null | Element} */ (path[0] || event.target);

		last_propagated_event = event;

		// composedPath contains list of nodes the event has propagated through.
		// We check __root to skip all nodes below it in case this is a
		// parent of the __root node, which indicates that there's nested
		// mounted apps. In this case we don't want to trigger events multiple times.
		var path_idx = 0;

		// the `last_propagated_event === event` check is redundant, but
		// without it the variable will be DCE'd and things will
		// fail mysteriously in Firefox
		// @ts-expect-error is added below
		var handled_at = last_propagated_event === event && event.__root;

		if (handled_at) {
			var at_idx = path.indexOf(handled_at);
			if (
				at_idx !== -1 &&
				(handler_element === document || handler_element === /** @type {any} */ (window))
			) {
				// This is the fallback document listener or a window listener, but the event was already handled
				// -> ignore, but set handle_at to document/window so that we're resetting the event
				// chain in case someone manually dispatches the same event object again.
				// @ts-expect-error
				event.__root = handler_element;
				return;
			}

			// We're deliberately not skipping if the index is higher, because
			// someone could create an event programmatically and emit it multiple times,
			// in which case we want to handle the whole propagation chain properly each time.
			// (this will only be a false negative if the event is dispatched multiple times and
			// the fallback document listener isn't reached in between, but that's super rare)
			var handler_idx = path.indexOf(handler_element);
			if (handler_idx === -1) {
				// handle_idx can theoretically be -1 (happened in some JSDOM testing scenarios with an event listener on the window object)
				// so guard against that, too, and assume that everything was handled at this point.
				return;
			}

			if (at_idx <= handler_idx) {
				path_idx = at_idx;
			}
		}

		current_target = /** @type {Element} */ (path[path_idx] || event.target);
		// there can only be one delegated event per element, and we either already handled the current target,
		// or this is the very first target in the chain which has a non-delegated listener, in which case it's safe
		// to handle a possible delegated event on it later (through the root delegation listener for example).
		if (current_target === handler_element) return;

		// Proxy currentTarget to correct target
		define_property(event, 'currentTarget', {
			configurable: true,
			get() {
				return current_target || owner_document;
			}
		});

		// This started because of Chromium issue https://chromestatus.com/feature/5128696823545856,
		// where removal or moving of of the DOM can cause sync `blur` events to fire, which can cause logic
		// to run inside the current `active_reaction`, which isn't what we want at all. However, on reflection,
		// it's probably best that all event handled by Svelte have this behaviour, as we don't really want
		// an event handler to run in the context of another reaction or effect.
		var previous_reaction = active_reaction;
		var previous_effect = active_effect;
		set_active_reaction(null);
		set_active_effect(null);

		try {
			/**
			 * @type {unknown}
			 */
			var throw_error;
			/**
			 * @type {unknown[]}
			 */
			var other_errors = [];

			while (current_target !== null) {
				/** @type {null | Element} */
				var parent_element =
					current_target.assignedSlot ||
					current_target.parentNode ||
					/** @type {any} */ (current_target).host ||
					null;

				try {
					// @ts-expect-error
					var delegated = current_target['__' + event_name];

					if (
						delegated != null &&
						(!(/** @type {any} */ (current_target).disabled) ||
							// DOM could've been updated already by the time this is reached, so we check this as well
							// -> the target could not have been disabled because it emits the event in the first place
							event.target === current_target)
					) {
						delegated.call(current_target, event);
					}
				} catch (error) {
					if (throw_error) {
						other_errors.push(error);
					} else {
						throw_error = error;
					}
				}
				if (event.cancelBubble || parent_element === handler_element || parent_element === null) {
					break;
				}
				current_target = parent_element;
			}

			if (throw_error) {
				for (let error of other_errors) {
					// Throw the rest of the errors, one-by-one on a microtask
					queueMicrotask(() => {
						throw error;
					});
				}
				throw throw_error;
			}
		} finally {
			// @ts-expect-error is used above
			event.__root = handler_element;
			// @ts-ignore remove proxy on currentTarget
			delete event.currentTarget;
			set_active_reaction(previous_reaction);
			set_active_effect(previous_effect);
		}
	}

	/** @param {string} html */
	function create_fragment_from_html(html) {
		var elem = document.createElement('template');
		elem.innerHTML = html.replaceAll('<!>', '<!---->'); // XHTML compliance
		return elem.content;
	}

	/** @import { Effect, EffectNodes, TemplateNode } from '#client' */
	/** @import { TemplateStructure } from './types' */

	/**
	 * @param {TemplateNode} start
	 * @param {TemplateNode | null} end
	 */
	function assign_nodes(start, end) {
		var effect = /** @type {Effect} */ (active_effect);
		if (effect.nodes === null) {
			effect.nodes = { start, end, a: null, t: null };
		}
	}

	/**
	 * @param {string} content
	 * @param {number} flags
	 * @returns {() => Node | Node[]}
	 */
	/*#__NO_SIDE_EFFECTS__*/
	function from_html(content, flags) {
		var is_fragment = (flags & TEMPLATE_FRAGMENT) !== 0;
		var use_import_node = (flags & TEMPLATE_USE_IMPORT_NODE) !== 0;

		/** @type {Node} */
		var node;

		/**
		 * Whether or not the first item is a text/element node. If not, we need to
		 * create an additional comment node to act as `effect.nodes.start`
		 */
		var has_start = !content.startsWith('<!>');

		return () => {
			if (hydrating) {
				assign_nodes(hydrate_node, null);
				return hydrate_node;
			}

			if (node === undefined) {
				node = create_fragment_from_html(has_start ? content : '<!>' + content);
				if (!is_fragment) node = /** @type {TemplateNode} */ (get_first_child(node));
			}

			var clone = /** @type {TemplateNode} */ (
				use_import_node || is_firefox ? document.importNode(node, true) : node.cloneNode(true)
			);

			if (is_fragment) {
				var start = /** @type {TemplateNode} */ (get_first_child(clone));
				var end = /** @type {TemplateNode} */ (clone.lastChild);

				assign_nodes(start, end);
			} else {
				assign_nodes(clone, clone);
			}

			return clone;
		};
	}

	/**
	 * Don't mark this as side-effect-free, hydration needs to walk all nodes
	 * @param {any} value
	 */
	function text(value = '') {
		if (!hydrating) {
			var t = create_text(value + '');
			assign_nodes(t, t);
			return t;
		}

		var node = hydrate_node;

		if (node.nodeType !== TEXT_NODE) {
			// if an {expression} is empty during SSR, we need to insert an empty text node
			node.before((node = create_text()));
			set_hydrate_node(node);
		}

		assign_nodes(node, node);
		return node;
	}

	/**
	 * @returns {TemplateNode | DocumentFragment}
	 */
	function comment() {
		// we're not delegating to `template` here for performance reasons
		if (hydrating) {
			assign_nodes(hydrate_node, null);
			return hydrate_node;
		}

		var frag = document.createDocumentFragment();
		var start = document.createComment('');
		var anchor = create_text();
		frag.append(start, anchor);

		assign_nodes(start, anchor);

		return frag;
	}

	/**
	 * Assign the created (or in hydration mode, traversed) dom elements to the current block
	 * and insert the elements into the dom (in client mode).
	 * @param {Text | Comment | Element} anchor
	 * @param {DocumentFragment | Element} dom
	 */
	function append(anchor, dom) {
		if (hydrating) {
			var effect = /** @type {Effect & { nodes: EffectNodes }} */ (active_effect);

			// When hydrating and outer component and an inner component is async, i.e. blocked on a promise,
			// then by the time the inner resolves we have already advanced to the end of the hydrated nodes
			// of the parent component. Check for defined for that reason to avoid rewinding the parent's end marker.
			if ((effect.f & EFFECT_RAN) === 0 || effect.nodes.end === null) {
				effect.nodes.end = hydrate_node;
			}

			hydrate_next();
			return;
		}

		if (anchor === null) {
			// edge case — void `<svelte:element>` with content
			return;
		}

		anchor.before(/** @type {Node} */ (dom));
	}

	/**
	 * Subset of delegated events which should be passive by default.
	 * These two are already passive via browser defaults on window, document and body.
	 * But since
	 * - we're delegating them
	 * - they happen often
	 * - they apply to mobile which is generally less performant
	 * we're marking them as passive by default for other elements, too.
	 */
	const PASSIVE_EVENTS = ['touchstart', 'touchmove'];

	/**
	 * Returns `true` if `name` is a passive event
	 * @param {string} name
	 */
	function is_passive_event(name) {
		return PASSIVE_EVENTS.includes(name);
	}

	/** @import { ComponentContext, Effect, EffectNodes, TemplateNode } from '#client' */
	/** @import { Component, ComponentType, SvelteComponent, MountOptions } from '../../index.js' */

	/**
	 * This is normally true — block effects should run their intro transitions —
	 * but is false during hydration (unless `options.intro` is `true`) and
	 * when creating the children of a `<svelte:element>` that just changed tag
	 */
	let should_intro = true;

	/**
	 * @param {Element} text
	 * @param {string} value
	 * @returns {void}
	 */
	function set_text(text, value) {
		// For objects, we apply string coercion (which might make things like $state array references in the template reactive) before diffing
		var str = value == null ? '' : typeof value === 'object' ? value + '' : value;
		// @ts-expect-error
		if (str !== (text.__t ??= text.nodeValue)) {
			// @ts-expect-error
			text.__t = str;
			text.nodeValue = str + '';
		}
	}

	/**
	 * Mounts a component to the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component.
	 * Transitions will play during the initial render unless the `intro` option is set to `false`.
	 *
	 * @template {Record<string, any>} Props
	 * @template {Record<string, any>} Exports
	 * @param {ComponentType<SvelteComponent<Props>> | Component<Props, Exports, any>} component
	 * @param {MountOptions<Props>} options
	 * @returns {Exports}
	 */
	function mount(component, options) {
		return _mount(component, options);
	}

	/**
	 * Hydrates a component on the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component
	 *
	 * @template {Record<string, any>} Props
	 * @template {Record<string, any>} Exports
	 * @param {ComponentType<SvelteComponent<Props>> | Component<Props, Exports, any>} component
	 * @param {{} extends Props ? {
	 * 		target: Document | Element | ShadowRoot;
	 * 		props?: Props;
	 * 		events?: Record<string, (e: any) => any>;
	 *  	context?: Map<any, any>;
	 * 		intro?: boolean;
	 * 		recover?: boolean;
	 * 	} : {
	 * 		target: Document | Element | ShadowRoot;
	 * 		props: Props;
	 * 		events?: Record<string, (e: any) => any>;
	 *  	context?: Map<any, any>;
	 * 		intro?: boolean;
	 * 		recover?: boolean;
	 * 	}} options
	 * @returns {Exports}
	 */
	function hydrate(component, options) {
		init_operations();
		options.intro = options.intro ?? false;
		const target = options.target;
		const was_hydrating = hydrating;
		const previous_hydrate_node = hydrate_node;

		try {
			var anchor = get_first_child(target);

			while (
				anchor &&
				(anchor.nodeType !== COMMENT_NODE || /** @type {Comment} */ (anchor).data !== HYDRATION_START)
			) {
				anchor = get_next_sibling(anchor);
			}

			if (!anchor) {
				throw HYDRATION_ERROR;
			}

			set_hydrating(true);
			set_hydrate_node(/** @type {Comment} */ (anchor));

			const instance = _mount(component, { ...options, anchor });

			set_hydrating(false);

			return /**  @type {Exports} */ (instance);
		} catch (error) {
			// re-throw Svelte errors - they are certainly not related to hydration
			if (
				error instanceof Error &&
				error.message.split('\n').some((line) => line.startsWith('https://svelte.dev/e/'))
			) {
				throw error;
			}
			if (error !== HYDRATION_ERROR) {
				// eslint-disable-next-line no-console
				console.warn('Failed to hydrate: ', error);
			}

			if (options.recover === false) {
				hydration_failed();
			}

			// If an error occurred above, the operations might not yet have been initialised.
			init_operations();
			clear_text_content(target);

			set_hydrating(false);
			return mount(component, options);
		} finally {
			set_hydrating(was_hydrating);
			set_hydrate_node(previous_hydrate_node);
		}
	}

	/** @type {Map<string, number>} */
	const document_listeners = new Map();

	/**
	 * @template {Record<string, any>} Exports
	 * @param {ComponentType<SvelteComponent<any>> | Component<any>} Component
	 * @param {MountOptions} options
	 * @returns {Exports}
	 */
	function _mount(Component, { target, anchor, props = {}, events, context, intro = true }) {
		init_operations();

		/** @type {Set<string>} */
		var registered_events = new Set();

		/** @param {Array<string>} events */
		var event_handle = (events) => {
			for (var i = 0; i < events.length; i++) {
				var event_name = events[i];

				if (registered_events.has(event_name)) continue;
				registered_events.add(event_name);

				var passive = is_passive_event(event_name);

				// Add the event listener to both the container and the document.
				// The container listener ensures we catch events from within in case
				// the outer content stops propagation of the event.
				target.addEventListener(event_name, handle_event_propagation, { passive });

				var n = document_listeners.get(event_name);

				if (n === undefined) {
					// The document listener ensures we catch events that originate from elements that were
					// manually moved outside of the container (e.g. via manual portals).
					document.addEventListener(event_name, handle_event_propagation, { passive });
					document_listeners.set(event_name, 1);
				} else {
					document_listeners.set(event_name, n + 1);
				}
			}
		};

		event_handle(array_from(all_registered_events));
		root_event_handles.add(event_handle);

		/** @type {Exports} */
		// @ts-expect-error will be defined because the render effect runs synchronously
		var component = undefined;

		var unmount = component_root(() => {
			var anchor_node = anchor ?? target.appendChild(create_text());

			boundary(
				/** @type {TemplateNode} */ (anchor_node),
				{
					pending: () => {}
				},
				(anchor_node) => {
					if (context) {
						push({});
						var ctx = /** @type {ComponentContext} */ (component_context);
						ctx.c = context;
					}

					if (events) {
						// We can't spread the object or else we'd lose the state proxy stuff, if it is one
						/** @type {any} */ (props).$$events = events;
					}

					if (hydrating) {
						assign_nodes(/** @type {TemplateNode} */ (anchor_node), null);
					}

					should_intro = intro;
					// @ts-expect-error the public typings are not what the actual function looks like
					component = Component(anchor_node, props) || {};
					should_intro = true;

					if (hydrating) {
						/** @type {Effect & { nodes: EffectNodes }} */ (active_effect).nodes.end = hydrate_node;

						if (
							hydrate_node === null ||
							hydrate_node.nodeType !== COMMENT_NODE ||
							/** @type {Comment} */ (hydrate_node).data !== HYDRATION_END
						) {
							hydration_mismatch();
							throw HYDRATION_ERROR;
						}
					}

					if (context) {
						pop();
					}
				}
			);

			return () => {
				for (var event_name of registered_events) {
					target.removeEventListener(event_name, handle_event_propagation);

					var n = /** @type {number} */ (document_listeners.get(event_name));

					if (--n === 0) {
						document.removeEventListener(event_name, handle_event_propagation);
						document_listeners.delete(event_name);
					} else {
						document_listeners.set(event_name, n);
					}
				}

				root_event_handles.delete(event_handle);

				if (anchor_node !== anchor) {
					anchor_node.parentNode?.removeChild(anchor_node);
				}
			};
		});

		mounted_components.set(component, unmount);
		return component;
	}

	/**
	 * References of the components that were mounted or hydrated.
	 * Uses a `WeakMap` to avoid memory leaks.
	 */
	let mounted_components = new WeakMap();

	/**
	 * Unmounts a component that was previously mounted using `mount` or `hydrate`.
	 *
	 * Since 5.13.0, if `options.outro` is `true`, [transitions](https://svelte.dev/docs/svelte/transition) will play before the component is removed from the DOM.
	 *
	 * Returns a `Promise` that resolves after transitions have completed if `options.outro` is true, or immediately otherwise (prior to 5.13.0, returns `void`).
	 *
	 * ```js
	 * import { mount, unmount } from 'svelte';
	 * import App from './App.svelte';
	 *
	 * const app = mount(App, { target: document.body });
	 *
	 * // later...
	 * unmount(app, { outro: true });
	 * ```
	 * @param {Record<string, any>} component
	 * @param {{ outro?: boolean }} [options]
	 * @returns {Promise<void>}
	 */
	function unmount(component, options) {
		const fn = mounted_components.get(component);

		if (fn) {
			mounted_components.delete(component);
			return fn(options);
		}

		return Promise.resolve();
	}

	/** @import { Effect, TemplateNode } from '#client' */

	/**
	 * @typedef {{ effect: Effect, fragment: DocumentFragment }} Branch
	 */

	/**
	 * @template Key
	 */
	class BranchManager {
		/** @type {TemplateNode} */
		anchor;

		/** @type {Map<Batch, Key>} */
		#batches = new Map();

		/**
		 * Map of keys to effects that are currently rendered in the DOM.
		 * These effects are visible and actively part of the document tree.
		 * Example:
		 * ```
		 * {#if condition}
		 * 	foo
		 * {:else}
		 * 	bar
		 * {/if}
		 * ```
		 * Can result in the entries `true->Effect` and `false->Effect`
		 * @type {Map<Key, Effect>}
		 */
		#onscreen = new Map();

		/**
		 * Similar to #onscreen with respect to the keys, but contains branches that are not yet
		 * in the DOM, because their insertion is deferred.
		 * @type {Map<Key, Branch>}
		 */
		#offscreen = new Map();

		/**
		 * Keys of effects that are currently outroing
		 * @type {Set<Key>}
		 */
		#outroing = new Set();

		/**
		 * Whether to pause (i.e. outro) on change, or destroy immediately.
		 * This is necessary for `<svelte:element>`
		 */
		#transition = true;

		/**
		 * @param {TemplateNode} anchor
		 * @param {boolean} transition
		 */
		constructor(anchor, transition = true) {
			this.anchor = anchor;
			this.#transition = transition;
		}

		#commit = () => {
			var batch = /** @type {Batch} */ (current_batch);

			// if this batch was made obsolete, bail
			if (!this.#batches.has(batch)) return;

			var key = /** @type {Key} */ (this.#batches.get(batch));

			var onscreen = this.#onscreen.get(key);

			if (onscreen) {
				// effect is already in the DOM — abort any current outro
				resume_effect(onscreen);
				this.#outroing.delete(key);
			} else {
				// effect is currently offscreen. put it in the DOM
				var offscreen = this.#offscreen.get(key);

				if (offscreen) {
					this.#onscreen.set(key, offscreen.effect);
					this.#offscreen.delete(key);

					// remove the anchor...
					/** @type {TemplateNode} */ (offscreen.fragment.lastChild).remove();

					// ...and append the fragment
					this.anchor.before(offscreen.fragment);
					onscreen = offscreen.effect;
				}
			}

			for (const [b, k] of this.#batches) {
				this.#batches.delete(b);

				if (b === batch) {
					// keep values for newer batches
					break;
				}

				const offscreen = this.#offscreen.get(k);

				if (offscreen) {
					// for older batches, destroy offscreen effects
					// as they will never be committed
					destroy_effect(offscreen.effect);
					this.#offscreen.delete(k);
				}
			}

			// outro/destroy all onscreen effects...
			for (const [k, effect] of this.#onscreen) {
				// ...except the one that was just committed
				//    or those that are already outroing (else the transition is aborted and the effect destroyed right away)
				if (k === key || this.#outroing.has(k)) continue;

				const on_destroy = () => {
					const keys = Array.from(this.#batches.values());

					if (keys.includes(k)) {
						// keep the effect offscreen, as another batch will need it
						var fragment = document.createDocumentFragment();
						move_effect(effect, fragment);

						fragment.append(create_text()); // TODO can we avoid this?

						this.#offscreen.set(k, { effect, fragment });
					} else {
						destroy_effect(effect);
					}

					this.#outroing.delete(k);
					this.#onscreen.delete(k);
				};

				if (this.#transition || !onscreen) {
					this.#outroing.add(k);
					pause_effect(effect, on_destroy, false);
				} else {
					on_destroy();
				}
			}
		};

		/**
		 * @param {Batch} batch
		 */
		#discard = (batch) => {
			this.#batches.delete(batch);

			const keys = Array.from(this.#batches.values());

			for (const [k, branch] of this.#offscreen) {
				if (!keys.includes(k)) {
					destroy_effect(branch.effect);
					this.#offscreen.delete(k);
				}
			}
		};

		/**
		 *
		 * @param {any} key
		 * @param {null | ((target: TemplateNode) => void)} fn
		 */
		ensure(key, fn) {
			var batch = /** @type {Batch} */ (current_batch);
			var defer = should_defer_append();

			if (fn && !this.#onscreen.has(key) && !this.#offscreen.has(key)) {
				if (defer) {
					var fragment = document.createDocumentFragment();
					var target = create_text();

					fragment.append(target);

					this.#offscreen.set(key, {
						effect: branch(() => fn(target)),
						fragment
					});
				} else {
					this.#onscreen.set(
						key,
						branch(() => fn(this.anchor))
					);
				}
			}

			this.#batches.set(batch, key);

			if (defer) {
				for (const [k, effect] of this.#onscreen) {
					if (k === key) {
						batch.skipped_effects.delete(effect);
					} else {
						batch.skipped_effects.add(effect);
					}
				}

				for (const [k, branch] of this.#offscreen) {
					if (k === key) {
						batch.skipped_effects.delete(branch.effect);
					} else {
						batch.skipped_effects.add(branch.effect);
					}
				}

				batch.oncommit(this.#commit);
				batch.ondiscard(this.#discard);
			} else {
				if (hydrating) {
					this.anchor = hydrate_node;
				}

				this.#commit();
			}
		}
	}

	/** @import { ComponentContext, ComponentContextLegacy } from '#client' */
	/** @import { EventDispatcher } from './index.js' */
	/** @import { NotFunction } from './internal/types.js' */

	/**
	 * `onMount`, like [`$effect`](https://svelte.dev/docs/svelte/$effect), schedules a function to run as soon as the component has been mounted to the DOM.
	 * Unlike `$effect`, the provided function only runs once.
	 *
	 * It must be called during the component's initialisation (but doesn't need to live _inside_ the component;
	 * it can be called from an external module). If a function is returned _synchronously_ from `onMount`,
	 * it will be called when the component is unmounted.
	 *
	 * `onMount` functions do not run during [server-side rendering](https://svelte.dev/docs/svelte/svelte-server#render).
	 *
	 * @template T
	 * @param {() => NotFunction<T> | Promise<NotFunction<T>> | (() => any)} fn
	 * @returns {void}
	 */
	function onMount(fn) {
		if (component_context === null) {
			lifecycle_outside_component();
		}

		if (legacy_mode_flag && component_context.l !== null) {
			init_update_callbacks(component_context).m.push(fn);
		} else {
			user_effect(() => {
				const cleanup = untrack(fn);
				if (typeof cleanup === 'function') return /** @type {() => void} */ (cleanup);
			});
		}
	}

	/**
	 * Legacy-mode: Init callbacks object for onMount/beforeUpdate/afterUpdate
	 * @param {ComponentContext} context
	 */
	function init_update_callbacks(context) {
		var l = /** @type {ComponentContextLegacy} */ (context).l;
		return (l.u ??= { a: [], b: [], m: [] });
	}

	/** @import { TemplateNode } from '#client' */

	// TODO reinstate https://github.com/sveltejs/svelte/pull/15250

	/**
	 * @param {TemplateNode} node
	 * @param {(branch: (fn: (anchor: Node) => void, flag?: boolean) => void) => void} fn
	 * @param {boolean} [elseif] True if this is an `{:else if ...}` block rather than an `{#if ...}`, as that affects which transitions are considered 'local'
	 * @returns {void}
	 */
	function if_block(node, fn, elseif = false) {
		if (hydrating) {
			hydrate_next();
		}

		var branches = new BranchManager(node);
		var flags = elseif ? EFFECT_TRANSPARENT : 0;

		/**
		 * @param {boolean} condition,
		 * @param {null | ((anchor: Node) => void)} fn
		 */
		function update_branch(condition, fn) {
			if (hydrating) {
				const is_else = read_hydration_instruction(node) === HYDRATION_START_ELSE;

				if (condition === is_else) {
					// Hydration mismatch: remove everything inside the anchor and start fresh.
					// This could happen with `{#if browser}...{/if}`, for example
					var anchor = skip_nodes();

					set_hydrate_node(anchor);
					branches.anchor = anchor;

					set_hydrating(false);
					branches.ensure(condition, fn);
					set_hydrating(true);

					return;
				}
			}

			branches.ensure(condition, fn);
		}

		block(() => {
			var has_branch = false;

			fn((fn, flag = true) => {
				has_branch = true;
				update_branch(flag, fn);
			});

			if (!has_branch) {
				update_branch(false, null);
			}
		}, flags);
	}

	/** @import { EachItem, EachOutroGroup, EachState, Effect, EffectNodes, MaybeSource, Source, TemplateNode, TransitionManager, Value } from '#client' */
	/** @import { Batch } from '../../reactivity/batch.js'; */

	// When making substantive changes to this file, validate them with the each block stress test:
	// https://svelte.dev/playground/1972b2cf46564476ad8c8c6405b23b7b
	// This test also exists in this repo, as `packages/svelte/tests/manual/each-stress-test`

	/**
	 * @param {any} _
	 * @param {number} i
	 */
	function index(_, i) {
		return i;
	}

	/**
	 * Pause multiple effects simultaneously, and coordinate their
	 * subsequent destruction. Used in each blocks
	 * @param {EachState} state
	 * @param {Effect[]} to_destroy
	 * @param {null | Node} controlled_anchor
	 */
	function pause_effects(state, to_destroy, controlled_anchor) {
		/** @type {TransitionManager[]} */
		var transitions = [];
		var length = to_destroy.length;

		/** @type {EachOutroGroup} */
		var group;
		var remaining = to_destroy.length;

		for (var i = 0; i < length; i++) {
			let effect = to_destroy[i];

			pause_effect(
				effect,
				() => {
					if (group) {
						group.pending.delete(effect);
						group.done.add(effect);

						if (group.pending.size === 0) {
							var groups = /** @type {Set<EachOutroGroup>} */ (state.outrogroups);

							destroy_effects(array_from(group.done));
							groups.delete(group);

							if (groups.size === 0) {
								state.outrogroups = null;
							}
						}
					} else {
						remaining -= 1;
					}
				},
				false
			);
		}

		if (remaining === 0) {
			// If we're in a controlled each block (i.e. the block is the only child of an
			// element), and we are removing all items, _and_ there are no out transitions,
			// we can use the fast path — emptying the element and replacing the anchor
			var fast_path = transitions.length === 0 && controlled_anchor !== null;

			if (fast_path) {
				var anchor = /** @type {Element} */ (controlled_anchor);
				var parent_node = /** @type {Element} */ (anchor.parentNode);

				clear_text_content(parent_node);
				parent_node.append(anchor);

				state.items.clear();
			}

			destroy_effects(to_destroy, !fast_path);
		} else {
			group = {
				pending: new Set(to_destroy),
				done: new Set()
			};

			(state.outrogroups ??= new Set()).add(group);
		}
	}

	/**
	 * @param {Effect[]} to_destroy
	 * @param {boolean} remove_dom
	 */
	function destroy_effects(to_destroy, remove_dom = true) {
		// TODO only destroy effects if no pending batch needs them. otherwise,
		// just re-add the `EFFECT_OFFSCREEN` flag
		for (var i = 0; i < to_destroy.length; i++) {
			destroy_effect(to_destroy[i], remove_dom);
		}
	}

	/** @type {TemplateNode} */
	var offscreen_anchor;

	/**
	 * @template V
	 * @param {Element | Comment} node The next sibling node, or the parent node if this is a 'controlled' block
	 * @param {number} flags
	 * @param {() => V[]} get_collection
	 * @param {(value: V, index: number) => any} get_key
	 * @param {(anchor: Node, item: MaybeSource<V>, index: MaybeSource<number>) => void} render_fn
	 * @param {null | ((anchor: Node) => void)} fallback_fn
	 * @returns {void}
	 */
	function each(node, flags, get_collection, get_key, render_fn, fallback_fn = null) {
		var anchor = node;

		/** @type {Map<any, EachItem>} */
		var items = new Map();

		var is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;

		if (is_controlled) {
			var parent_node = /** @type {Element} */ (node);

			anchor = hydrating
				? set_hydrate_node(get_first_child(parent_node))
				: parent_node.appendChild(create_text());
		}

		if (hydrating) {
			hydrate_next();
		}

		/** @type {Effect | null} */
		var fallback = null;

		// TODO: ideally we could use derived for runes mode but because of the ability
		// to use a store which can be mutated, we can't do that here as mutating a store
		// will still result in the collection array being the same from the store
		var each_array = derived_safe_equal(() => {
			var collection = get_collection();

			return is_array(collection) ? collection : collection == null ? [] : array_from(collection);
		});

		/** @type {V[]} */
		var array;

		var first_run = true;

		function commit() {
			state.fallback = fallback;
			reconcile(state, array, anchor, flags, get_key);

			if (fallback !== null) {
				if (array.length === 0) {
					if ((fallback.f & EFFECT_OFFSCREEN) === 0) {
						resume_effect(fallback);
					} else {
						fallback.f ^= EFFECT_OFFSCREEN;
						move(fallback, null, anchor);
					}
				} else {
					pause_effect(fallback, () => {
						// TODO only null out if no pending batch needs it,
						// otherwise re-add `fallback.fragment` and move the
						// effect into it
						fallback = null;
					});
				}
			}
		}

		var effect = block(() => {
			array = /** @type {V[]} */ (get(each_array));
			var length = array.length;

			/** `true` if there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
			let mismatch = false;

			if (hydrating) {
				var is_else = read_hydration_instruction(anchor) === HYDRATION_START_ELSE;

				if (is_else !== (length === 0)) {
					// hydration mismatch — remove the server-rendered DOM and start over
					anchor = skip_nodes();

					set_hydrate_node(anchor);
					set_hydrating(false);
					mismatch = true;
				}
			}

			var keys = new Set();
			var batch = /** @type {Batch} */ (current_batch);
			var defer = should_defer_append();

			for (var index = 0; index < length; index += 1) {
				if (
					hydrating &&
					hydrate_node.nodeType === COMMENT_NODE &&
					/** @type {Comment} */ (hydrate_node).data === HYDRATION_END
				) {
					// The server rendered fewer items than expected,
					// so break out and continue appending non-hydrated items
					anchor = /** @type {Comment} */ (hydrate_node);
					mismatch = true;
					set_hydrating(false);
				}

				var value = array[index];
				var key = get_key(value, index);

				var item = first_run ? null : items.get(key);

				if (item) {
					// update before reconciliation, to trigger any async updates
					if (item.v) internal_set(item.v, value);
					if (item.i) internal_set(item.i, index);

					if (defer) {
						batch.skipped_effects.delete(item.e);
					}
				} else {
					item = create_item(
						items,
						first_run ? anchor : (offscreen_anchor ??= create_text()),
						value,
						key,
						index,
						render_fn,
						flags,
						get_collection
					);

					if (!first_run) {
						item.e.f |= EFFECT_OFFSCREEN;
					}

					items.set(key, item);
				}

				keys.add(key);
			}

			if (length === 0 && fallback_fn && !fallback) {
				if (first_run) {
					fallback = branch(() => fallback_fn(anchor));
				} else {
					fallback = branch(() => fallback_fn((offscreen_anchor ??= create_text())));
					fallback.f |= EFFECT_OFFSCREEN;
				}
			}

			// remove excess nodes
			if (hydrating && length > 0) {
				set_hydrate_node(skip_nodes());
			}

			if (!first_run) {
				if (defer) {
					for (const [key, item] of items) {
						if (!keys.has(key)) {
							batch.skipped_effects.add(item.e);
						}
					}

					batch.oncommit(commit);
					batch.ondiscard(() => {
						// TODO presumably we need to do something here?
					});
				} else {
					commit();
				}
			}

			if (mismatch) {
				// continue in hydration mode
				set_hydrating(true);
			}

			// When we mount the each block for the first time, the collection won't be
			// connected to this effect as the effect hasn't finished running yet and its deps
			// won't be assigned. However, it's possible that when reconciling the each block
			// that a mutation occurred and it's made the collection MAYBE_DIRTY, so reading the
			// collection again can provide consistency to the reactive graph again as the deriveds
			// will now be `CLEAN`.
			get(each_array);
		});

		/** @type {EachState} */
		var state = { effect, items, outrogroups: null, fallback };

		first_run = false;

		if (hydrating) {
			anchor = hydrate_node;
		}
	}

	/**
	 * Add, remove, or reorder items output by an each block as its input changes
	 * @template V
	 * @param {EachState} state
	 * @param {Array<V>} array
	 * @param {Element | Comment | Text} anchor
	 * @param {number} flags
	 * @param {(value: V, index: number) => any} get_key
	 * @returns {void}
	 */
	function reconcile(state, array, anchor, flags, get_key) {
		var is_animated = (flags & EACH_IS_ANIMATED) !== 0;

		var length = array.length;
		var items = state.items;
		var current = state.effect.first;

		/** @type {undefined | Set<Effect>} */
		var seen;

		/** @type {Effect | null} */
		var prev = null;

		/** @type {undefined | Set<Effect>} */
		var to_animate;

		/** @type {Effect[]} */
		var matched = [];

		/** @type {Effect[]} */
		var stashed = [];

		/** @type {V} */
		var value;

		/** @type {any} */
		var key;

		/** @type {Effect | undefined} */
		var effect;

		/** @type {number} */
		var i;

		if (is_animated) {
			for (i = 0; i < length; i += 1) {
				value = array[i];
				key = get_key(value, i);
				effect = /** @type {EachItem} */ (items.get(key)).e;

				// offscreen == coming in now, no animation in that case,
				// else this would happen https://github.com/sveltejs/svelte/issues/17181
				if ((effect.f & EFFECT_OFFSCREEN) === 0) {
					effect.nodes?.a?.measure();
					(to_animate ??= new Set()).add(effect);
				}
			}
		}

		for (i = 0; i < length; i += 1) {
			value = array[i];
			key = get_key(value, i);

			effect = /** @type {EachItem} */ (items.get(key)).e;

			if (state.outrogroups !== null) {
				for (const group of state.outrogroups) {
					group.pending.delete(effect);
					group.done.delete(effect);
				}
			}

			if ((effect.f & EFFECT_OFFSCREEN) !== 0) {
				effect.f ^= EFFECT_OFFSCREEN;

				if (effect === current) {
					move(effect, null, anchor);
				} else {
					var next = prev ? prev.next : current;

					if (effect === state.effect.last) {
						state.effect.last = effect.prev;
					}

					if (effect.prev) effect.prev.next = effect.next;
					if (effect.next) effect.next.prev = effect.prev;
					link(state, prev, effect);
					link(state, effect, next);

					move(effect, next, anchor);
					prev = effect;

					matched = [];
					stashed = [];

					current = prev.next;
					continue;
				}
			}

			if ((effect.f & INERT) !== 0) {
				resume_effect(effect);
				if (is_animated) {
					effect.nodes?.a?.unfix();
					(to_animate ??= new Set()).delete(effect);
				}
			}

			if (effect !== current) {
				if (seen !== undefined && seen.has(effect)) {
					if (matched.length < stashed.length) {
						// more efficient to move later items to the front
						var start = stashed[0];
						var j;

						prev = start.prev;

						var a = matched[0];
						var b = matched[matched.length - 1];

						for (j = 0; j < matched.length; j += 1) {
							move(matched[j], start, anchor);
						}

						for (j = 0; j < stashed.length; j += 1) {
							seen.delete(stashed[j]);
						}

						link(state, a.prev, b.next);
						link(state, prev, a);
						link(state, b, start);

						current = start;
						prev = b;
						i -= 1;

						matched = [];
						stashed = [];
					} else {
						// more efficient to move earlier items to the back
						seen.delete(effect);
						move(effect, current, anchor);

						link(state, effect.prev, effect.next);
						link(state, effect, prev === null ? state.effect.first : prev.next);
						link(state, prev, effect);

						prev = effect;
					}

					continue;
				}

				matched = [];
				stashed = [];

				while (current !== null && current !== effect) {
					(seen ??= new Set()).add(current);
					stashed.push(current);
					current = current.next;
				}

				if (current === null) {
					continue;
				}
			}

			if ((effect.f & EFFECT_OFFSCREEN) === 0) {
				matched.push(effect);
			}

			prev = effect;
			current = effect.next;
		}

		if (state.outrogroups !== null) {
			for (const group of state.outrogroups) {
				if (group.pending.size === 0) {
					destroy_effects(array_from(group.done));
					state.outrogroups?.delete(group);
				}
			}

			if (state.outrogroups.size === 0) {
				state.outrogroups = null;
			}
		}

		if (current !== null || seen !== undefined) {
			/** @type {Effect[]} */
			var to_destroy = [];

			if (seen !== undefined) {
				for (effect of seen) {
					if ((effect.f & INERT) === 0) {
						to_destroy.push(effect);
					}
				}
			}

			while (current !== null) {
				// If the each block isn't inert, then inert effects are currently outroing and will be removed once the transition is finished
				if ((current.f & INERT) === 0 && current !== state.fallback) {
					to_destroy.push(current);
				}

				current = current.next;
			}

			var destroy_length = to_destroy.length;

			if (destroy_length > 0) {
				var controlled_anchor = (flags & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;

				if (is_animated) {
					for (i = 0; i < destroy_length; i += 1) {
						to_destroy[i].nodes?.a?.measure();
					}

					for (i = 0; i < destroy_length; i += 1) {
						to_destroy[i].nodes?.a?.fix();
					}
				}

				pause_effects(state, to_destroy, controlled_anchor);
			}
		}

		if (is_animated) {
			queue_micro_task(() => {
				if (to_animate === undefined) return;
				for (effect of to_animate) {
					effect.nodes?.a?.apply();
				}
			});
		}
	}

	/**
	 * @template V
	 * @param {Map<any, EachItem>} items
	 * @param {Node} anchor
	 * @param {V} value
	 * @param {unknown} key
	 * @param {number} index
	 * @param {(anchor: Node, item: V | Source<V>, index: number | Value<number>, collection: () => V[]) => void} render_fn
	 * @param {number} flags
	 * @param {() => V[]} get_collection
	 * @returns {EachItem}
	 */
	function create_item(items, anchor, value, key, index, render_fn, flags, get_collection) {
		var v =
			(flags & EACH_ITEM_REACTIVE) !== 0
				? (flags & EACH_ITEM_IMMUTABLE) === 0
					? mutable_source(value, false, false)
					: source(value)
				: null;

		var i = (flags & EACH_INDEX_REACTIVE) !== 0 ? source(index) : null;

		return {
			v,
			i,
			e: branch(() => {
				render_fn(anchor, v ?? value, i ?? index, get_collection);

				return () => {
					items.delete(key);
				};
			})
		};
	}

	/**
	 * @param {Effect} effect
	 * @param {Effect | null} next
	 * @param {Text | Element | Comment} anchor
	 */
	function move(effect, next, anchor) {
		if (!effect.nodes) return;

		var node = effect.nodes.start;
		var end = effect.nodes.end;

		var dest =
			next && (next.f & EFFECT_OFFSCREEN) === 0
				? /** @type {EffectNodes} */ (next.nodes).start
				: anchor;

		while (node !== null) {
			var next_node = /** @type {TemplateNode} */ (get_next_sibling(node));
			dest.before(node);

			if (node === end) {
				return;
			}

			node = next_node;
		}
	}

	/**
	 * @param {EachState} state
	 * @param {Effect | null} prev
	 * @param {Effect | null} next
	 */
	function link(state, prev, next) {
		if (prev === null) {
			state.effect.first = next;
		} else {
			prev.next = next;
		}

		if (next === null) {
			state.effect.last = prev;
		} else {
			next.prev = prev;
		}
	}

	/** @import { Effect, TemplateNode } from '#client' */

	/**
	 * @param {Element | Text | Comment} node
	 * @param {() => string} get_value
	 * @param {boolean} [svg]
	 * @param {boolean} [mathml]
	 * @param {boolean} [skip_warning]
	 * @returns {void}
	 */
	function html(node, get_value, svg = false, mathml = false, skip_warning = false) {
		var anchor = node;

		var value = '';

		template_effect(() => {
			var effect = /** @type {Effect} */ (active_effect);

			if (value === (value = get_value() ?? '')) {
				if (hydrating) hydrate_next();
				return;
			}

			if (effect.nodes !== null) {
				remove_effect_dom(effect.nodes.start, /** @type {TemplateNode} */ (effect.nodes.end));
				effect.nodes = null;
			}

			if (value === '') return;

			if (hydrating) {
				// We're deliberately not trying to repair mismatches between server and client,
				// as it's costly and error-prone (and it's an edge case to have a mismatch anyway)
				/** @type {Comment} */ (hydrate_node).data;

				/** @type {TemplateNode | null} */
				var next = hydrate_next();
				var last = next;

				while (
					next !== null &&
					(next.nodeType !== COMMENT_NODE || /** @type {Comment} */ (next).data !== '')
				) {
					last = next;
					next = get_next_sibling(next);
				}

				if (next === null) {
					hydration_mismatch();
					throw HYDRATION_ERROR;
				}

				assign_nodes(hydrate_node, last);
				anchor = set_hydrate_node(next);
				return;
			}

			var html = value + '';
			if (svg) html = `<svg>${html}</svg>`;
			else if (mathml) html = `<math>${html}</math>`;

			// Don't use create_fragment_with_script_from_html here because that would mean script tags are executed.
			// @html is basically `.innerHTML = ...` and that doesn't execute scripts either due to security reasons.
			/** @type {DocumentFragment | Element} */
			var node = create_fragment_from_html(html);

			if (svg || mathml) {
				node = /** @type {Element} */ (get_first_child(node));
			}

			assign_nodes(
				/** @type {TemplateNode} */ (get_first_child(node)),
				/** @type {TemplateNode} */ (node.lastChild)
			);

			if (svg || mathml) {
				while (get_first_child(node)) {
					anchor.before(/** @type {TemplateNode} */ (get_first_child(node)));
				}
			} else {
				anchor.before(node);
			}
		});
	}

	/**
	 * @param {Comment} anchor
	 * @param {Record<string, any>} $$props
	 * @param {string} name
	 * @param {Record<string, unknown>} slot_props
	 * @param {null | ((anchor: Comment) => void)} fallback_fn
	 */
	function slot(anchor, $$props, name, slot_props, fallback_fn) {
		if (hydrating) {
			hydrate_next();
		}

		var slot_fn = $$props.$$slots?.[name];
		// Interop: Can use snippets to fill slots
		var is_interop = false;
		if (slot_fn === true) {
			slot_fn = $$props['children' ];
			is_interop = true;
		}

		if (slot_fn === undefined) ; else {
			slot_fn(anchor, is_interop ? () => slot_props : slot_props);
		}
	}

	/** @import { Raf } from '#client' */

	const now = () => performance.now() ;

	/** @type {Raf} */
	const raf = {
		// don't access requestAnimationFrame eagerly outside method
		// this allows basic testing of user code without JSDOM
		// bunder will eval and remove ternary when the user's app is built
		tick: /** @param {any} _ */ (_) => (requestAnimationFrame )(_),
		now: () => now(),
		tasks: new Set()
	};

	/** @import { TaskCallback, Task, TaskEntry } from '#client' */

	// TODO move this into timing.js where it probably belongs

	/**
	 * @returns {void}
	 */
	function run_tasks() {
		// use `raf.now()` instead of the `requestAnimationFrame` callback argument, because
		// otherwise things can get wonky https://github.com/sveltejs/svelte/pull/14541
		const now = raf.now();

		raf.tasks.forEach((task) => {
			if (!task.c(now)) {
				raf.tasks.delete(task);
				task.f();
			}
		});

		if (raf.tasks.size !== 0) {
			raf.tick(run_tasks);
		}
	}

	/**
	 * Creates a new task that runs on each raf frame
	 * until it returns a falsy value or is aborted
	 * @param {TaskCallback} callback
	 * @returns {Task}
	 */
	function loop(callback) {
		/** @type {TaskEntry} */
		let task;

		if (raf.tasks.size === 0) {
			raf.tick(run_tasks);
		}

		return {
			promise: new Promise((fulfill) => {
				raf.tasks.add((task = { c: callback, f: fulfill }));
			}),
			abort() {
				raf.tasks.delete(task);
			}
		};
	}

	/** @import { AnimateFn, Animation, AnimationConfig, EachItem, Effect, EffectNodes, TransitionFn, TransitionManager } from '#client' */

	/**
	 * @param {Element} element
	 * @param {'introstart' | 'introend' | 'outrostart' | 'outroend'} type
	 * @returns {void}
	 */
	function dispatch_event(element, type) {
		without_reactive_context(() => {
			element.dispatchEvent(new CustomEvent(type));
		});
	}

	/**
	 * Converts a property to the camel-case format expected by Element.animate(), KeyframeEffect(), and KeyframeEffect.setKeyframes().
	 * @param {string} style
	 * @returns {string}
	 */
	function css_property_to_camelcase(style) {
		// in compliance with spec
		if (style === 'float') return 'cssFloat';
		if (style === 'offset') return 'cssOffset';

		// do not rename custom @properties
		if (style.startsWith('--')) return style;

		const parts = style.split('-');
		if (parts.length === 1) return parts[0];
		return (
			parts[0] +
			parts
				.slice(1)
				.map(/** @param {any} word */ (word) => word[0].toUpperCase() + word.slice(1))
				.join('')
		);
	}

	/**
	 * @param {string} css
	 * @returns {Keyframe}
	 */
	function css_to_keyframe(css) {
		/** @type {Keyframe} */
		const keyframe = {};
		const parts = css.split(';');
		for (const part of parts) {
			const [property, value] = part.split(':');
			if (!property || value === undefined) break;

			const formatted_property = css_property_to_camelcase(property.trim());
			keyframe[formatted_property] = value.trim();
		}
		return keyframe;
	}

	/** @param {number} t */
	const linear$1 = (t) => t;

	/**
	 * Called inside keyed `{#each ...}` blocks (as `$.animation(...)`). This creates an animation manager
	 * and attaches it to the block, so that moves can be animated following reconciliation.
	 * @template P
	 * @param {Element} element
	 * @param {() => AnimateFn<P | undefined>} get_fn
	 * @param {(() => P) | null} get_params
	 */
	function animation(element, get_fn, get_params) {
		var effect = /** @type {Effect} */ (active_effect);
		var nodes = /** @type {EffectNodes} */ (effect.nodes);

		/** @type {DOMRect} */
		var from;

		/** @type {DOMRect} */
		var to;

		/** @type {Animation | undefined} */
		var animation;

		/** @type {null | { position: string, width: string, height: string, transform: string }} */
		var original_styles = null;

		nodes.a ??= {
			element,
			measure() {
				from = this.element.getBoundingClientRect();
			},
			apply() {
				animation?.abort();

				to = this.element.getBoundingClientRect();

				if (
					from.left !== to.left ||
					from.right !== to.right ||
					from.top !== to.top ||
					from.bottom !== to.bottom
				) {
					const options = get_fn()(this.element, { from, to }, get_params?.());

					animation = animate(this.element, options, undefined, 1, () => {
						animation?.abort();
						animation = undefined;
					});
				}
			},
			fix() {
				// If an animation is already running, transforming the element is likely to fail,
				// because the styles applied by the animation take precedence. In the case of crossfade,
				// that means the `translate(...)` of the crossfade transition overrules the `translate(...)`
				// we would apply below, leading to the element jumping somewhere to the top left.
				if (element.getAnimations().length) return;

				// It's important to destructure these to get fixed values - the object itself has getters,
				// and changing the style to 'absolute' can for example influence the width.
				var { position, width, height } = getComputedStyle(element);

				if (position !== 'absolute' && position !== 'fixed') {
					var style = /** @type {HTMLElement | SVGElement} */ (element).style;

					original_styles = {
						position: style.position,
						width: style.width,
						height: style.height,
						transform: style.transform
					};

					style.position = 'absolute';
					style.width = width;
					style.height = height;
					var to = element.getBoundingClientRect();

					if (from.left !== to.left || from.top !== to.top) {
						var transform = `translate(${from.left - to.left}px, ${from.top - to.top}px)`;
						style.transform = style.transform ? `${style.transform} ${transform}` : transform;
					}
				}
			},
			unfix() {
				if (original_styles) {
					var style = /** @type {HTMLElement | SVGElement} */ (element).style;

					style.position = original_styles.position;
					style.width = original_styles.width;
					style.height = original_styles.height;
					style.transform = original_styles.transform;
				}
			}
		};

		// in the case of a `<svelte:element>`, it's possible for `$.animation(...)` to be called
		// when an animation manager already exists, if the tag changes. in that case, we need to
		// swap out the element rather than creating a new manager, in case it happened at the same
		// moment as a reconciliation
		nodes.a.element = element;
	}

	/**
	 * Called inside block effects as `$.transition(...)`. This creates a transition manager and
	 * attaches it to the current effect — later, inside `pause_effect` and `resume_effect`, we
	 * use this to create `intro` and `outro` transitions.
	 * @template P
	 * @param {number} flags
	 * @param {HTMLElement} element
	 * @param {() => TransitionFn<P | undefined>} get_fn
	 * @param {(() => P) | null} get_params
	 * @returns {void}
	 */
	function transition(flags, element, get_fn, get_params) {
		var is_intro = (flags & TRANSITION_IN) !== 0;
		var is_outro = (flags & TRANSITION_OUT) !== 0;
		var is_both = is_intro && is_outro;
		var is_global = (flags & TRANSITION_GLOBAL) !== 0;

		/** @type {'in' | 'out' | 'both'} */
		var direction = is_both ? 'both' : is_intro ? 'in' : 'out';

		/** @type {AnimationConfig | ((opts: { direction: 'in' | 'out' }) => AnimationConfig) | undefined} */
		var current_options;

		var inert = element.inert;

		/**
		 * The default overflow style, stashed so we can revert changes during the transition
		 * that are necessary to work around a Safari <18 bug
		 * TODO 6.0 remove this, if older versions of Safari have died out enough
		 */
		var overflow = element.style.overflow;

		/** @type {Animation | undefined} */
		var intro;

		/** @type {Animation | undefined} */
		var outro;

		function get_options() {
			return without_reactive_context(() => {
				// If a transition is still ongoing, we use the existing options rather than generating
				// new ones. This ensures that reversible transitions reverse smoothly, rather than
				// jumping to a new spot because (for example) a different `duration` was used
				return (current_options ??= get_fn()(element, get_params?.() ?? /** @type {P} */ ({}), {
					direction
				}));
			});
		}

		/** @type {TransitionManager} */
		var transition = {
			is_global,
			in() {
				element.inert = inert;

				if (!is_intro) {
					outro?.abort();
					outro?.reset?.();
					return;
				}

				if (!is_outro) {
					// if we intro then outro then intro again, we want to abort the first intro,
					// if it's not a bidirectional transition
					intro?.abort();
				}

				dispatch_event(element, 'introstart');

				intro = animate(element, get_options(), outro, 1, () => {
					dispatch_event(element, 'introend');

					// Ensure we cancel the animation to prevent leaking
					intro?.abort();
					intro = current_options = undefined;

					element.style.overflow = overflow;
				});
			},
			out(fn) {
				if (!is_outro) {
					fn?.();
					current_options = undefined;
					return;
				}

				element.inert = true;

				dispatch_event(element, 'outrostart');

				outro = animate(element, get_options(), intro, 0, () => {
					dispatch_event(element, 'outroend');
					fn?.();
				});
			},
			stop: () => {
				intro?.abort();
				outro?.abort();
			}
		};

		var e = /** @type {Effect & { nodes: EffectNodes }} */ (active_effect);

		(e.nodes.t ??= []).push(transition);

		// if this is a local transition, we only want to run it if the parent (branch) effect's
		// parent (block) effect is where the state change happened. we can determine that by
		// looking at whether the block effect is currently initializing
		if (is_intro && should_intro) {
			var run = is_global;

			if (!run) {
				var block = /** @type {Effect | null} */ (e.parent);

				// skip over transparent blocks (e.g. snippets, else-if blocks)
				while (block && (block.f & EFFECT_TRANSPARENT) !== 0) {
					while ((block = block.parent)) {
						if ((block.f & BLOCK_EFFECT) !== 0) break;
					}
				}

				run = !block || (block.f & EFFECT_RAN) !== 0;
			}

			if (run) {
				effect(() => {
					untrack(() => transition.in());
				});
			}
		}
	}

	/**
	 * Animates an element, according to the provided configuration
	 * @param {Element} element
	 * @param {AnimationConfig | ((opts: { direction: 'in' | 'out' }) => AnimationConfig)} options
	 * @param {Animation | undefined} counterpart The corresponding intro/outro to this outro/intro
	 * @param {number} t2 The target `t` value — `1` for intro, `0` for outro
	 * @param {(() => void)} on_finish Called after successfully completing the animation
	 * @returns {Animation}
	 */
	function animate(element, options, counterpart, t2, on_finish) {
		var is_intro = t2 === 1;

		if (is_function(options)) {
			// In the case of a deferred transition (such as `crossfade`), `option` will be
			// a function rather than an `AnimationConfig`. We need to call this function
			// once the DOM has been updated...
			/** @type {Animation} */
			var a;
			var aborted = false;

			queue_micro_task(() => {
				if (aborted) return;
				var o = options({ direction: is_intro ? 'in' : 'out' });
				a = animate(element, o, counterpart, t2, on_finish);
			});

			// ...but we want to do so without using `async`/`await` everywhere, so
			// we return a facade that allows everything to remain synchronous
			return {
				abort: () => {
					aborted = true;
					a?.abort();
				},
				deactivate: () => a.deactivate(),
				reset: () => a.reset(),
				t: () => a.t()
			};
		}

		counterpart?.deactivate();

		if (!options?.duration) {
			on_finish();

			return {
				abort: noop,
				deactivate: noop,
				reset: noop,
				t: () => t2
			};
		}

		const { delay = 0, css, tick, easing = linear$1 } = options;

		var keyframes = [];

		if (is_intro && counterpart === undefined) {
			if (tick) {
				tick(0, 1); // TODO put in nested effect, to avoid interleaved reads/writes?
			}

			if (css) {
				var styles = css_to_keyframe(css(0, 1));
				keyframes.push(styles, styles);
			}
		}

		var get_t = () => 1 - t2;

		// create a dummy animation that lasts as long as the delay (but with whatever devtools
		// multiplier is in effect). in the common case that it is `0`, we keep it anyway so that
		// the CSS keyframes aren't created until the DOM is updated
		//
		// fill forwards to prevent the element from rendering without styles applied
		// see https://github.com/sveltejs/svelte/issues/14732
		var animation = element.animate(keyframes, { duration: delay, fill: 'forwards' });

		animation.onfinish = () => {
			// remove dummy animation from the stack to prevent conflict with main animation
			animation.cancel();

			// for bidirectional transitions, we start from the current position,
			// rather than doing a full intro/outro
			var t1 = counterpart?.t() ?? 1 - t2;
			counterpart?.abort();

			var delta = t2 - t1;
			var duration = /** @type {number} */ (options.duration) * Math.abs(delta);
			var keyframes = [];

			if (duration > 0) {
				/**
				 * Whether or not the CSS includes `overflow: hidden`, in which case we need to
				 * add it as an inline style to work around a Safari <18 bug
				 * TODO 6.0 remove this, if possible
				 */
				var needs_overflow_hidden = false;

				if (css) {
					var n = Math.ceil(duration / (1000 / 60)); // `n` must be an integer, or we risk missing the `t2` value

					for (var i = 0; i <= n; i += 1) {
						var t = t1 + delta * easing(i / n);
						var styles = css_to_keyframe(css(t, 1 - t));
						keyframes.push(styles);

						needs_overflow_hidden ||= styles.overflow === 'hidden';
					}
				}

				if (needs_overflow_hidden) {
					/** @type {HTMLElement} */ (element).style.overflow = 'hidden';
				}

				get_t = () => {
					var time = /** @type {number} */ (
						/** @type {globalThis.Animation} */ (animation).currentTime
					);

					return t1 + delta * easing(time / duration);
				};

				if (tick) {
					loop(() => {
						if (animation.playState !== 'running') return false;

						var t = get_t();
						tick(t, 1 - t);

						return true;
					});
				}
			}

			animation = element.animate(keyframes, { duration, fill: 'forwards' });

			animation.onfinish = () => {
				get_t = () => t2;
				tick?.(t2, 1 - t2);
				on_finish();
			};
		};

		return {
			abort: () => {
				if (animation) {
					animation.cancel();
					// This prevents memory leaks in Chromium
					animation.effect = null;
					// This prevents onfinish to be launched after cancel(),
					// which can happen in some rare cases
					// see https://github.com/sveltejs/svelte/issues/13681
					animation.onfinish = noop;
				}
			},
			deactivate: () => {
				on_finish = noop;
			},
			reset: () => {
				if (t2 === 0) {
					tick?.(1, 0);
				}
			},
			t: () => get_t()
		};
	}

	/**
	 * @param {Node} anchor
	 * @param {{ hash: string, code: string }} css
	 */
	function append_styles$1(anchor, css) {
		// Use `queue_micro_task` to ensure `anchor` is in the DOM, otherwise getRootNode() will yield wrong results
		effect(() => {
			var root = anchor.getRootNode();

			var target = /** @type {ShadowRoot} */ (root).host
				? /** @type {ShadowRoot} */ (root)
				: /** @type {Document} */ (root).head ?? /** @type {Document} */ (root.ownerDocument).head;

			// Always querying the DOM is roughly the same perf as additionally checking for presence in a map first assuming
			// that you'll get cache hits half of the time, so we just always query the dom for simplicity and code savings.
			if (!target.querySelector('#' + css.hash)) {
				const style = document.createElement('style');
				style.id = css.hash;
				style.textContent = css.code;

				target.appendChild(style);
			}
		});
	}

	const whitespace = [...' \t\n\r\f\u00a0\u000b\ufeff'];

	/**
	 * @param {any} value
	 * @param {string | null} [hash]
	 * @param {Record<string, boolean>} [directives]
	 * @returns {string | null}
	 */
	function to_class(value, hash, directives) {
		var classname = value == null ? '' : '' + value;

		if (hash) {
			classname = classname ? classname + ' ' + hash : hash;
		}

		if (directives) {
			for (var key in directives) {
				if (directives[key]) {
					classname = classname ? classname + ' ' + key : key;
				} else if (classname.length) {
					var len = key.length;
					var a = 0;

					while ((a = classname.indexOf(key, a)) >= 0) {
						var b = a + len;

						if (
							(a === 0 || whitespace.includes(classname[a - 1])) &&
							(b === classname.length || whitespace.includes(classname[b]))
						) {
							classname = (a === 0 ? '' : classname.substring(0, a)) + classname.substring(b + 1);
						} else {
							a = b;
						}
					}
				}
			}
		}

		return classname === '' ? null : classname;
	}

	/**
	 *
	 * @param {Record<string,any>} styles
	 * @param {boolean} important
	 */
	function append_styles(styles, important = false) {
		var separator = important ? ' !important;' : ';';
		var css = '';

		for (var key in styles) {
			var value = styles[key];
			if (value != null && value !== '') {
				css += ' ' + key + ': ' + value + separator;
			}
		}

		return css;
	}

	/**
	 * @param {string} name
	 * @returns {string}
	 */
	function to_css_name(name) {
		if (name[0] !== '-' || name[1] !== '-') {
			return name.toLowerCase();
		}
		return name;
	}

	/**
	 * @param {any} value
	 * @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [styles]
	 * @returns {string | null}
	 */
	function to_style(value, styles) {
		if (styles) {
			var new_style = '';

			/** @type {Record<string,any> | undefined} */
			var normal_styles;

			/** @type {Record<string,any> | undefined} */
			var important_styles;

			if (Array.isArray(styles)) {
				normal_styles = styles[0];
				important_styles = styles[1];
			} else {
				normal_styles = styles;
			}

			if (value) {
				value = String(value)
					.replaceAll(/\s*\/\*.*?\*\/\s*/g, '')
					.trim();

				/** @type {boolean | '"' | "'"} */
				var in_str = false;
				var in_apo = 0;
				var in_comment = false;

				var reserved_names = [];

				if (normal_styles) {
					reserved_names.push(...Object.keys(normal_styles).map(to_css_name));
				}
				if (important_styles) {
					reserved_names.push(...Object.keys(important_styles).map(to_css_name));
				}

				var start_index = 0;
				var name_index = -1;

				const len = value.length;
				for (var i = 0; i < len; i++) {
					var c = value[i];

					if (in_comment) {
						if (c === '/' && value[i - 1] === '*') {
							in_comment = false;
						}
					} else if (in_str) {
						if (in_str === c) {
							in_str = false;
						}
					} else if (c === '/' && value[i + 1] === '*') {
						in_comment = true;
					} else if (c === '"' || c === "'") {
						in_str = c;
					} else if (c === '(') {
						in_apo++;
					} else if (c === ')') {
						in_apo--;
					}

					if (!in_comment && in_str === false && in_apo === 0) {
						if (c === ':' && name_index === -1) {
							name_index = i;
						} else if (c === ';' || i === len - 1) {
							if (name_index !== -1) {
								var name = to_css_name(value.substring(start_index, name_index).trim());

								if (!reserved_names.includes(name)) {
									if (c !== ';') {
										i++;
									}

									var property = value.substring(start_index, i).trim();
									new_style += ' ' + property + ';';
								}
							}

							start_index = i + 1;
							name_index = -1;
						}
					}
				}
			}

			if (normal_styles) {
				new_style += append_styles(normal_styles);
			}

			if (important_styles) {
				new_style += append_styles(important_styles, true);
			}

			new_style = new_style.trim();
			return new_style === '' ? null : new_style;
		}

		return value == null ? null : String(value);
	}

	/**
	 * @param {Element} dom
	 * @param {boolean | number} is_html
	 * @param {string | null} value
	 * @param {string} [hash]
	 * @param {Record<string, any>} [prev_classes]
	 * @param {Record<string, any>} [next_classes]
	 * @returns {Record<string, boolean> | undefined}
	 */
	function set_class(dom, is_html, value, hash, prev_classes, next_classes) {
		// @ts-expect-error need to add __className to patched prototype
		var prev = dom.__className;

		if (
			hydrating ||
			prev !== value ||
			prev === undefined // for edge case of `class={undefined}`
		) {
			var next_class_name = to_class(value, hash, next_classes);

			if (!hydrating || next_class_name !== dom.getAttribute('class')) {
				// Removing the attribute when the value is only an empty string causes
				// performance issues vs simply making the className an empty string. So
				// we should only remove the class if the value is nullish
				// and there no hash/directives :
				if (next_class_name == null) {
					dom.removeAttribute('class');
				} else {
					dom.className = next_class_name;
				}
			}

			// @ts-expect-error need to add __className to patched prototype
			dom.__className = value;
		} else if (next_classes && prev_classes !== next_classes) {
			for (var key in next_classes) {
				var is_present = !!next_classes[key];

				if (prev_classes == null || is_present !== !!prev_classes[key]) {
					dom.classList.toggle(key, is_present);
				}
			}
		}

		return next_classes;
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} dom
	 * @param {Record<string, any>} prev
	 * @param {Record<string, any>} next
	 * @param {string} [priority]
	 */
	function update_styles(dom, prev = {}, next, priority) {
		for (var key in next) {
			var value = next[key];

			if (prev[key] !== value) {
				if (next[key] == null) {
					dom.style.removeProperty(key);
				} else {
					dom.style.setProperty(key, value, priority);
				}
			}
		}
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} dom
	 * @param {string | null} value
	 * @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [prev_styles]
	 * @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [next_styles]
	 */
	function set_style(dom, value, prev_styles, next_styles) {
		// @ts-expect-error
		var prev = dom.__style;

		if (hydrating || prev !== value) {
			var next_style_attr = to_style(value, next_styles);

			if (!hydrating || next_style_attr !== dom.getAttribute('style')) {
				if (next_style_attr == null) {
					dom.removeAttribute('style');
				} else {
					dom.style.cssText = next_style_attr;
				}
			}

			// @ts-expect-error
			dom.__style = value;
		} else if (next_styles) {
			if (Array.isArray(next_styles)) {
				update_styles(dom, prev_styles?.[0], next_styles[0]);
				update_styles(dom, prev_styles?.[1], next_styles[1], 'important');
			} else {
				update_styles(dom, prev_styles, next_styles);
			}
		}

		return next_styles;
	}

	/**
	 * Selects the correct option(s) (depending on whether this is a multiple select)
	 * @template V
	 * @param {HTMLSelectElement} select
	 * @param {V} value
	 * @param {boolean} mounting
	 */
	function select_option(select, value, mounting = false) {
		if (select.multiple) {
			// If value is null or undefined, keep the selection as is
			if (value == undefined) {
				return;
			}

			// If not an array, warn and keep the selection as is
			if (!is_array(value)) {
				return select_multiple_invalid_value();
			}

			// Otherwise, update the selection
			for (var option of select.options) {
				option.selected = value.includes(get_option_value(option));
			}

			return;
		}

		for (option of select.options) {
			var option_value = get_option_value(option);
			if (is(option_value, value)) {
				option.selected = true;
				return;
			}
		}

		if (!mounting || value !== undefined) {
			select.selectedIndex = -1; // no option should be selected
		}
	}

	/**
	 * Selects the correct option(s) if `value` is given,
	 * and then sets up a mutation observer to sync the
	 * current selection to the dom when it changes. Such
	 * changes could for example occur when options are
	 * inside an `#each` block.
	 * @param {HTMLSelectElement} select
	 */
	function init_select(select) {
		var observer = new MutationObserver(() => {
			// @ts-ignore
			select_option(select, select.__value);
			// Deliberately don't update the potential binding value,
			// the model should be preserved unless explicitly changed
		});

		observer.observe(select, {
			// Listen to option element changes
			childList: true,
			subtree: true, // because of <optgroup>
			// Listen to option element value attribute changes
			// (doesn't get notified of select value changes,
			// because that property is not reflected as an attribute)
			attributes: true,
			attributeFilter: ['value']
		});

		teardown(() => {
			observer.disconnect();
		});
	}

	/** @param {HTMLOptionElement} option */
	function get_option_value(option) {
		// __value only exists if the <option> has a value attribute
		if ('__value' in option) {
			return option.__value;
		} else {
			return option.value;
		}
	}

	/** @import { Effect } from '#client' */

	const IS_CUSTOM_ELEMENT = Symbol('is custom element');
	const IS_HTML = Symbol('is html');

	/**
	 * The value/checked attribute in the template actually corresponds to the defaultValue property, so we need
	 * to remove it upon hydration to avoid a bug when someone resets the form value.
	 * @param {HTMLInputElement} input
	 * @returns {void}
	 */
	function remove_input_defaults(input) {
		if (!hydrating) return;

		var already_removed = false;

		// We try and remove the default attributes later, rather than sync during hydration.
		// Doing it sync during hydration has a negative impact on performance, but deferring the
		// work in an idle task alleviates this greatly. If a form reset event comes in before
		// the idle callback, then we ensure the input defaults are cleared just before.
		var remove_defaults = () => {
			if (already_removed) return;
			already_removed = true;

			// Remove the attributes but preserve the values
			if (input.hasAttribute('value')) {
				var value = input.value;
				set_attribute(input, 'value', null);
				input.value = value;
			}

			if (input.hasAttribute('checked')) {
				var checked = input.checked;
				set_attribute(input, 'checked', null);
				input.checked = checked;
			}
		};

		// @ts-expect-error
		input.__on_r = remove_defaults;
		queue_micro_task(remove_defaults);
		add_form_reset_listener();
	}

	/**
	 * @param {Element} element
	 * @param {any} value
	 */
	function set_value(element, value) {
		var attributes = get_attributes(element);

		if (
			attributes.value ===
				(attributes.value =
					// treat null and undefined the same for the initial value
					value ?? undefined) ||
			// @ts-expect-error
			// `progress` elements always need their value set when it's `0`
			(element.value === value && (value !== 0 || element.nodeName !== 'PROGRESS'))
		) {
			return;
		}

		// @ts-expect-error
		element.value = value ?? '';
	}

	/**
	 * @param {Element} element
	 * @param {boolean} checked
	 */
	function set_checked(element, checked) {
		var attributes = get_attributes(element);

		if (
			attributes.checked ===
			(attributes.checked =
				// treat null and undefined the same for the initial value
				checked ?? undefined)
		) {
			return;
		}

		// @ts-expect-error
		element.checked = checked;
	}

	/**
	 * @param {Element} element
	 * @param {string} attribute
	 * @param {string | null} value
	 * @param {boolean} [skip_warning]
	 */
	function set_attribute(element, attribute, value, skip_warning) {
		var attributes = get_attributes(element);

		if (hydrating) {
			attributes[attribute] = element.getAttribute(attribute);

			if (
				attribute === 'src' ||
				attribute === 'srcset' ||
				(attribute === 'href' && element.nodeName === 'LINK')
			) {

				// If we reset these attributes, they would result in another network request, which we want to avoid.
				// We assume they are the same between client and server as checking if they are equal is expensive
				// (we can't just compare the strings as they can be different between client and server but result in the
				// same url, so we would need to create hidden anchor elements to compare them)
				return;
			}
		}

		if (attributes[attribute] === (attributes[attribute] = value)) return;

		if (attribute === 'loading') {
			// @ts-expect-error
			element[LOADING_ATTR_SYMBOL] = value;
		}

		if (value == null) {
			element.removeAttribute(attribute);
		} else if (typeof value !== 'string' && get_setters(element).includes(attribute)) {
			// @ts-ignore
			element[attribute] = value;
		} else {
			element.setAttribute(attribute, value);
		}
	}

	/**
	 *
	 * @param {Element} element
	 */
	function get_attributes(element) {
		return /** @type {Record<string | symbol, unknown>} **/ (
			// @ts-expect-error
			element.__attributes ??= {
				[IS_CUSTOM_ELEMENT]: element.nodeName.includes('-'),
				[IS_HTML]: element.namespaceURI === NAMESPACE_HTML
			}
		);
	}

	/** @type {Map<string, string[]>} */
	var setters_cache = new Map();

	/** @param {Element} element */
	function get_setters(element) {
		var cache_key = element.getAttribute('is') || element.nodeName;
		var setters = setters_cache.get(cache_key);
		if (setters) return setters;
		setters_cache.set(cache_key, (setters = []));

		var descriptors;
		var proto = element; // In the case of custom elements there might be setters on the instance
		var element_proto = Element.prototype;

		// Stop at Element, from there on there's only unnecessary setters we're not interested in
		// Do not use contructor.name here as that's unreliable in some browser environments
		while (element_proto !== proto) {
			descriptors = get_descriptors(proto);

			for (var key in descriptors) {
				if (descriptors[key].set) {
					setters.push(key);
				}
			}

			proto = get_prototype_of(proto);
		}

		return setters;
	}

	/** @import { Batch } from '../../../reactivity/batch.js' */

	/** @type {Set<HTMLInputElement[]>} */
	const pending = new Set();

	/**
	 * @param {HTMLInputElement[]} inputs
	 * @param {null | [number]} group_index
	 * @param {HTMLInputElement} input
	 * @param {() => unknown} get
	 * @param {(value: unknown) => void} set
	 * @returns {void}
	 */
	function bind_group(inputs, group_index, input, get, set = get) {
		var is_checkbox = input.getAttribute('type') === 'checkbox';
		var binding_group = inputs;

		// needs to be let or related code isn't treeshaken out if it's always false
		let hydration_mismatch = false;

		if (group_index !== null) {
			for (var index of group_index) {
				// @ts-expect-error
				binding_group = binding_group[index] ??= [];
			}
		}

		binding_group.push(input);

		listen_to_event_and_reset_event(
			input,
			'change',
			() => {
				// @ts-ignore
				var value = input.__value;

				if (is_checkbox) {
					value = get_binding_group_value(binding_group, value, input.checked);
				}

				set(value);
			},
			// TODO better default value handling
			() => set(is_checkbox ? [] : null)
		);

		render_effect(() => {
			var value = get();

			// If we are hydrating and the value has since changed, then use the update value
			// from the input instead.
			if (hydrating && input.defaultChecked !== input.checked) {
				hydration_mismatch = true;
				return;
			}

			if (is_checkbox) {
				value = value || [];
				// @ts-ignore
				input.checked = value.includes(input.__value);
			} else {
				// @ts-ignore
				input.checked = is(input.__value, value);
			}
		});

		teardown(() => {
			var index = binding_group.indexOf(input);

			if (index !== -1) {
				binding_group.splice(index, 1);
			}
		});

		if (!pending.has(binding_group)) {
			pending.add(binding_group);

			queue_micro_task(() => {
				// necessary to maintain binding group order in all insertion scenarios
				binding_group.sort((a, b) => (a.compareDocumentPosition(b) === 4 ? -1 : 1));
				pending.delete(binding_group);
			});
		}

		queue_micro_task(() => {
			if (hydration_mismatch) {
				var value;

				if (is_checkbox) {
					value = get_binding_group_value(binding_group, value, input.checked);
				} else {
					var hydration_input = binding_group.find((input) => input.checked);
					// @ts-ignore
					value = hydration_input?.__value;
				}

				set(value);
			}
		});
	}

	/**
	 * @template V
	 * @param {Array<HTMLInputElement>} group
	 * @param {V} __value
	 * @param {boolean} checked
	 * @returns {V[]}
	 */
	function get_binding_group_value(group, __value, checked) {
		/** @type {Set<V>} */
		var value = new Set();

		for (var i = 0; i < group.length; i += 1) {
			if (group[i].checked) {
				// @ts-ignore
				value.add(group[i].__value);
			}
		}

		if (!checked) {
			value.delete(__value);
		}

		return Array.from(value);
	}

	/**
	 * Resize observer singleton.
	 * One listener per element only!
	 * https://groups.google.com/a/chromium.org/g/blink-dev/c/z6ienONUb5A/m/F5-VcUZtBAAJ
	 */
	class ResizeObserverSingleton {
		/** */
		#listeners = new WeakMap();

		/** @type {ResizeObserver | undefined} */
		#observer;

		/** @type {ResizeObserverOptions} */
		#options;

		/** @static */
		static entries = new WeakMap();

		/** @param {ResizeObserverOptions} options */
		constructor(options) {
			this.#options = options;
		}

		/**
		 * @param {Element} element
		 * @param {(entry: ResizeObserverEntry) => any} listener
		 */
		observe(element, listener) {
			var listeners = this.#listeners.get(element) || new Set();
			listeners.add(listener);

			this.#listeners.set(element, listeners);
			this.#getObserver().observe(element, this.#options);

			return () => {
				var listeners = this.#listeners.get(element);
				listeners.delete(listener);

				if (listeners.size === 0) {
					this.#listeners.delete(element);
					/** @type {ResizeObserver} */ (this.#observer).unobserve(element);
				}
			};
		}

		#getObserver() {
			return (
				this.#observer ??
				(this.#observer = new ResizeObserver(
					/** @param {any} entries */ (entries) => {
						for (var entry of entries) {
							ResizeObserverSingleton.entries.set(entry.target, entry);
							for (var listener of this.#listeners.get(entry.target) || []) {
								listener(entry);
							}
						}
					}
				))
			);
		}
	}

	var resize_observer_border_box = /* @__PURE__ */ new ResizeObserverSingleton({
		box: 'border-box'
	});

	/**
	 * @param {HTMLElement} element
	 * @param {'clientWidth' | 'clientHeight' | 'offsetWidth' | 'offsetHeight'} type
	 * @param {(size: number) => void} set
	 */
	function bind_element_size(element, type, set) {
		var unsub = resize_observer_border_box.observe(element, () => set(element[type]));

		effect(() => {
			// The update could contain reads which should be ignored
			untrack(() => set(element[type]));
			return unsub;
		});
	}

	/**
	 * @param {any} bound_value
	 * @param {Element} element_or_component
	 * @returns {boolean}
	 */
	function is_bound_this(bound_value, element_or_component) {
		return (
			bound_value === element_or_component || bound_value?.[STATE_SYMBOL] === element_or_component
		);
	}

	/**
	 * @param {any} element_or_component
	 * @param {(value: unknown, ...parts: unknown[]) => void} update
	 * @param {(...parts: unknown[]) => unknown} get_value
	 * @param {() => unknown[]} [get_parts] Set if the this binding is used inside an each block,
	 * 										returns all the parts of the each block context that are used in the expression
	 * @returns {void}
	 */
	function bind_this(element_or_component = {}, update, get_value, get_parts) {
		effect(() => {
			/** @type {unknown[]} */
			var old_parts;

			/** @type {unknown[]} */
			var parts;

			render_effect(() => {
				old_parts = parts;
				// We only track changes to the parts, not the value itself to avoid unnecessary reruns.
				parts = [];

				untrack(() => {
					if (element_or_component !== get_value(...parts)) {
						update(element_or_component, ...parts);
						// If this is an effect rerun (cause: each block context changes), then nullify the binding at
						// the previous position if it isn't already taken over by a different effect.
						if (old_parts && is_bound_this(get_value(...old_parts), element_or_component)) {
							update(null, ...old_parts);
						}
					}
				});
			});

			return () => {
				// We cannot use effects in the teardown phase, we we use a microtask instead.
				queue_micro_task(() => {
					if (parts && is_bound_this(get_value(...parts), element_or_component)) {
						update(null, ...parts);
					}
				});
			};
		});

		return element_or_component;
	}

	/** @import { ComponentContextLegacy } from '#client' */

	/**
	 * Legacy-mode only: Call `onMount` callbacks and set up `beforeUpdate`/`afterUpdate` effects
	 * @param {boolean} [immutable]
	 */
	function init$1(immutable = false) {
		const context = /** @type {ComponentContextLegacy} */ (component_context);

		const callbacks = context.l.u;
		if (!callbacks) return;

		let props = () => deep_read_state(context.s);

		if (immutable) {
			let version = 0;
			let prev = /** @type {Record<string, any>} */ ({});

			// In legacy immutable mode, before/afterUpdate only fire if the object identity of a prop changes
			const d = derived(() => {
				let changed = false;
				const props = context.s;
				for (const key in props) {
					if (props[key] !== prev[key]) {
						prev[key] = props[key];
						changed = true;
					}
				}
				if (changed) version++;
				return version;
			});

			props = () => get(d);
		}

		// beforeUpdate
		if (callbacks.b.length) {
			user_pre_effect(() => {
				observe_all(context, props);
				run_all(callbacks.b);
			});
		}

		// onMount (must run before afterUpdate)
		user_effect(() => {
			const fns = untrack(() => callbacks.m.map(run));
			return () => {
				for (const fn of fns) {
					if (typeof fn === 'function') {
						fn();
					}
				}
			};
		});

		// afterUpdate
		if (callbacks.a.length) {
			user_effect(() => {
				observe_all(context, props);
				run_all(callbacks.a);
			});
		}
	}

	/**
	 * Invoke the getter of all signals associated with a component
	 * so they can be registered to the effect this function is called in.
	 * @param {ComponentContextLegacy} context
	 * @param {(() => void)} props
	 */
	function observe_all(context, props) {
		if (context.l.s) {
			for (const signal of context.l.s) get(signal);
		}

		props();
	}

	/** @import { StoreReferencesContainer } from '#client' */
	/** @import { Store } from '#shared' */

	/**
	 * Whether or not the prop currently being read is a store binding, as in
	 * `<Child bind:x={$y} />`. If it is, we treat the prop as mutable even in
	 * runes mode, and skip `binding_property_non_reactive` validation
	 */
	let is_store_binding = false;

	/**
	 * Returns a tuple that indicates whether `fn()` reads a prop that is a store binding.
	 * Used to prevent `binding_property_non_reactive` validation false positives and
	 * ensure that these props are treated as mutable even in runes mode
	 * @template T
	 * @param {() => T} fn
	 * @returns {[T, boolean]}
	 */
	function capture_store_binding(fn) {
		var previous_is_store_binding = is_store_binding;

		try {
			is_store_binding = false;
			return [fn(), is_store_binding];
		} finally {
			is_store_binding = previous_is_store_binding;
		}
	}

	/** @import { Effect, Source } from './types.js' */

	/**
	 * This function is responsible for synchronizing a possibly bound prop with the inner component state.
	 * It is used whenever the compiler sees that the component writes to the prop, or when it has a default prop_value.
	 * @template V
	 * @param {Record<string, unknown>} props
	 * @param {string} key
	 * @param {number} flags
	 * @param {V | (() => V)} [fallback]
	 * @returns {(() => V | ((arg: V) => V) | ((arg: V, mutation: boolean) => V))}
	 */
	function prop(props, key, flags, fallback) {
		var runes = !legacy_mode_flag || (flags & PROPS_IS_RUNES) !== 0;
		var bindable = (flags & PROPS_IS_BINDABLE) !== 0;
		var lazy = (flags & PROPS_IS_LAZY_INITIAL) !== 0;

		var fallback_value = /** @type {V} */ (fallback);
		var fallback_dirty = true;

		var get_fallback = () => {
			if (fallback_dirty) {
				fallback_dirty = false;

				fallback_value = lazy
					? untrack(/** @type {() => V} */ (fallback))
					: /** @type {V} */ (fallback);
			}

			return fallback_value;
		};

		/** @type {((v: V) => void) | undefined} */
		var setter;

		if (bindable) {
			// Can be the case when someone does `mount(Component, props)` with `let props = $state({...})`
			// or `createClassComponent(Component, props)`
			var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;

			setter =
				get_descriptor(props, key)?.set ??
				(is_entry_props && key in props ? (v) => (props[key] = v) : undefined);
		}

		var initial_value;
		var is_store_sub = false;

		if (bindable) {
			[initial_value, is_store_sub] = capture_store_binding(() => /** @type {V} */ (props[key]));
		} else {
			initial_value = /** @type {V} */ (props[key]);
		}

		if (initial_value === undefined && fallback !== undefined) {
			initial_value = get_fallback();

			if (setter) {
				if (runes) props_invalid_value();
				setter(initial_value);
			}
		}

		/** @type {() => V} */
		var getter;

		if (runes) {
			getter = () => {
				var value = /** @type {V} */ (props[key]);
				if (value === undefined) return get_fallback();
				fallback_dirty = true;
				return value;
			};
		} else {
			getter = () => {
				var value = /** @type {V} */ (props[key]);

				if (value !== undefined) {
					// in legacy mode, we don't revert to the fallback value
					// if the prop goes from defined to undefined. The easiest
					// way to model this is to make the fallback undefined
					// as soon as the prop has a value
					fallback_value = /** @type {V} */ (undefined);
				}

				return value === undefined ? fallback_value : value;
			};
		}

		// prop is never written to — we only need a getter
		if (runes && (flags & PROPS_IS_UPDATED) === 0) {
			return getter;
		}

		// prop is written to, but the parent component had `bind:foo` which
		// means we can just call `$$props.foo = value` directly
		if (setter) {
			var legacy_parent = props.$$legacy;
			return /** @type {() => V} */ (
				function (/** @type {V} */ value, /** @type {boolean} */ mutation) {
					if (arguments.length > 0) {
						// We don't want to notify if the value was mutated and the parent is in runes mode.
						// In that case the state proxy (if it exists) should take care of the notification.
						// If the parent is not in runes mode, we need to notify on mutation, too, that the prop
						// has changed because the parent will not be able to detect the change otherwise.
						if (!runes || !mutation || legacy_parent || is_store_sub) {
							/** @type {Function} */ (setter)(mutation ? getter() : value);
						}

						return value;
					}

					return getter();
				}
			);
		}

		// Either prop is written to, but there's no binding, which means we
		// create a derived that we can write to locally.
		// Or we are in legacy mode where we always create a derived to replicate that
		// Svelte 4 did not trigger updates when a primitive value was updated to the same value.
		var overridden = false;

		var d = ((flags & PROPS_IS_IMMUTABLE) !== 0 ? derived : derived_safe_equal)(() => {
			overridden = false;
			return getter();
		});

		// Capture the initial value if it's bindable
		if (bindable) get(d);

		var parent_effect = /** @type {Effect} */ (active_effect);

		return /** @type {() => V} */ (
			function (/** @type {any} */ value, /** @type {boolean} */ mutation) {
				if (arguments.length > 0) {
					const new_value = mutation ? get(d) : runes && bindable ? proxy(value) : value;

					set(d, new_value);
					overridden = true;

					if (fallback_value !== undefined) {
						fallback_value = new_value;
					}

					return value;
				}

				// special case — avoid recalculating the derived if we're in a
				// teardown function and the prop was overridden locally, or the
				// component was already destroyed (this latter part is necessary
				// because `bind:this` can read props after the component has
				// been destroyed. TODO simplify `bind:this`
				if ((is_destroying_effect && overridden) || (parent_effect.f & DESTROYED) !== 0) {
					return d.v;
				}

				return get(d);
			}
		);
	}

	/** @import { ComponentConstructorOptions, ComponentType, SvelteComponent, Component } from 'svelte' */

	/**
	 * Takes the same options as a Svelte 4 component and the component function and returns a Svelte 4 compatible component.
	 *
	 * @deprecated Use this only as a temporary solution to migrate your imperative component code to Svelte 5.
	 *
	 * @template {Record<string, any>} Props
	 * @template {Record<string, any>} Exports
	 * @template {Record<string, any>} Events
	 * @template {Record<string, any>} Slots
	 *
	 * @param {ComponentConstructorOptions<Props> & {
	 * 	component: ComponentType<SvelteComponent<Props, Events, Slots>> | Component<Props>;
	 * }} options
	 * @returns {SvelteComponent<Props, Events, Slots> & Exports}
	 */
	function createClassComponent(options) {
		// @ts-expect-error $$prop_def etc are not actually defined
		return new Svelte4Component(options);
	}

	/**
	 * Support using the component as both a class and function during the transition period
	 * @typedef  {{new (o: ComponentConstructorOptions): SvelteComponent;(...args: Parameters<Component<Record<string, any>>>): ReturnType<Component<Record<string, any>, Record<string, any>>>;}} LegacyComponentType
	 */

	class Svelte4Component {
		/** @type {any} */
		#events;

		/** @type {Record<string, any>} */
		#instance;

		/**
		 * @param {ComponentConstructorOptions & {
		 *  component: any;
		 * }} options
		 */
		constructor(options) {
			var sources = new Map();

			/**
			 * @param {string | symbol} key
			 * @param {unknown} value
			 */
			var add_source = (key, value) => {
				var s = mutable_source(value, false, false);
				sources.set(key, s);
				return s;
			};

			// Replicate coarse-grained props through a proxy that has a version source for
			// each property, which is incremented on updates to the property itself. Do not
			// use our $state proxy because that one has fine-grained reactivity.
			const props = new Proxy(
				{ ...(options.props || {}), $$events: {} },
				{
					get(target, prop) {
						return get(sources.get(prop) ?? add_source(prop, Reflect.get(target, prop)));
					},
					has(target, prop) {
						// Necessary to not throw "invalid binding" validation errors on the component side
						if (prop === LEGACY_PROPS) return true;

						get(sources.get(prop) ?? add_source(prop, Reflect.get(target, prop)));
						return Reflect.has(target, prop);
					},
					set(target, prop, value) {
						set(sources.get(prop) ?? add_source(prop, value), value);
						return Reflect.set(target, prop, value);
					}
				}
			);

			this.#instance = (options.hydrate ? hydrate : mount)(options.component, {
				target: options.target,
				anchor: options.anchor,
				props,
				context: options.context,
				intro: options.intro ?? false,
				recover: options.recover
			});

			// We don't flushSync for custom element wrappers or if the user doesn't want it,
			// or if we're in async mode since `flushSync()` will fail
			if ((!options?.props?.$$host || options.sync === false)) {
				flushSync();
			}

			this.#events = props.$$events;

			for (const key of Object.keys(this.#instance)) {
				if (key === '$set' || key === '$destroy' || key === '$on') continue;
				define_property(this, key, {
					get() {
						return this.#instance[key];
					},
					/** @param {any} value */
					set(value) {
						this.#instance[key] = value;
					},
					enumerable: true
				});
			}

			this.#instance.$set = /** @param {Record<string, any>} next */ (next) => {
				Object.assign(props, next);
			};

			this.#instance.$destroy = () => {
				unmount(this.#instance);
			};
		}

		/** @param {Record<string, any>} props */
		$set(props) {
			this.#instance.$set(props);
		}

		/**
		 * @param {string} event
		 * @param {(...args: any[]) => any} callback
		 * @returns {any}
		 */
		$on(event, callback) {
			this.#events[event] = this.#events[event] || [];

			/** @param {any[]} args */
			const cb = (...args) => callback.call(this, ...args);
			this.#events[event].push(cb);
			return () => {
				this.#events[event] = this.#events[event].filter(/** @param {any} fn */ (fn) => fn !== cb);
			};
		}

		$destroy() {
			this.#instance.$destroy();
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	/** @type {any} */
	let SvelteElement;

	if (typeof HTMLElement === 'function') {
		SvelteElement = class extends HTMLElement {
			/** The Svelte component constructor */
			$$ctor;
			/** Slots */
			$$s;
			/** @type {any} The Svelte component instance */
			$$c;
			/** Whether or not the custom element is connected */
			$$cn = false;
			/** @type {Record<string, any>} Component props data */
			$$d = {};
			/** `true` if currently in the process of reflecting component props back to attributes */
			$$r = false;
			/** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
			$$p_d = {};
			/** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
			$$l = {};
			/** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
			$$l_u = new Map();
			/** @type {any} The managed render effect for reflecting attributes */
			$$me;

			/**
			 * @param {*} $$componentCtor
			 * @param {*} $$slots
			 * @param {*} use_shadow_dom
			 */
			constructor($$componentCtor, $$slots, use_shadow_dom) {
				super();
				this.$$ctor = $$componentCtor;
				this.$$s = $$slots;
				if (use_shadow_dom) {
					this.attachShadow({ mode: 'open' });
				}
			}

			/**
			 * @param {string} type
			 * @param {EventListenerOrEventListenerObject} listener
			 * @param {boolean | AddEventListenerOptions} [options]
			 */
			addEventListener(type, listener, options) {
				// We can't determine upfront if the event is a custom event or not, so we have to
				// listen to both. If someone uses a custom event with the same name as a regular
				// browser event, this fires twice - we can't avoid that.
				this.$$l[type] = this.$$l[type] || [];
				this.$$l[type].push(listener);
				if (this.$$c) {
					const unsub = this.$$c.$on(type, listener);
					this.$$l_u.set(listener, unsub);
				}
				super.addEventListener(type, listener, options);
			}

			/**
			 * @param {string} type
			 * @param {EventListenerOrEventListenerObject} listener
			 * @param {boolean | AddEventListenerOptions} [options]
			 */
			removeEventListener(type, listener, options) {
				super.removeEventListener(type, listener, options);
				if (this.$$c) {
					const unsub = this.$$l_u.get(listener);
					if (unsub) {
						unsub();
						this.$$l_u.delete(listener);
					}
				}
			}

			async connectedCallback() {
				this.$$cn = true;
				if (!this.$$c) {
					// We wait one tick to let possible child slot elements be created/mounted
					await Promise.resolve();
					if (!this.$$cn || this.$$c) {
						return;
					}
					/** @param {string} name */
					function create_slot(name) {
						/**
						 * @param {Element} anchor
						 */
						return (anchor) => {
							const slot = document.createElement('slot');
							if (name !== 'default') slot.name = name;

							append(anchor, slot);
						};
					}
					/** @type {Record<string, any>} */
					const $$slots = {};
					const existing_slots = get_custom_elements_slots(this);
					for (const name of this.$$s) {
						if (name in existing_slots) {
							if (name === 'default' && !this.$$d.children) {
								this.$$d.children = create_slot(name);
								$$slots.default = true;
							} else {
								$$slots[name] = create_slot(name);
							}
						}
					}
					for (const attribute of this.attributes) {
						// this.$$data takes precedence over this.attributes
						const name = this.$$g_p(attribute.name);
						if (!(name in this.$$d)) {
							this.$$d[name] = get_custom_element_value(name, attribute.value, this.$$p_d, 'toProp');
						}
					}
					// Port over props that were set programmatically before ce was initialized
					for (const key in this.$$p_d) {
						// @ts-expect-error
						if (!(key in this.$$d) && this[key] !== undefined) {
							// @ts-expect-error
							this.$$d[key] = this[key]; // don't transform, these were set through JavaScript
							// @ts-expect-error
							delete this[key]; // remove the property that shadows the getter/setter
						}
					}
					this.$$c = createClassComponent({
						component: this.$$ctor,
						target: this.shadowRoot || this,
						props: {
							...this.$$d,
							$$slots,
							$$host: this
						}
					});

					// Reflect component props as attributes
					this.$$me = effect_root(() => {
						render_effect(() => {
							this.$$r = true;
							for (const key of object_keys(this.$$c)) {
								if (!this.$$p_d[key]?.reflect) continue;
								this.$$d[key] = this.$$c[key];
								const attribute_value = get_custom_element_value(
									key,
									this.$$d[key],
									this.$$p_d,
									'toAttribute'
								);
								if (attribute_value == null) {
									this.removeAttribute(this.$$p_d[key].attribute || key);
								} else {
									this.setAttribute(this.$$p_d[key].attribute || key, attribute_value);
								}
							}
							this.$$r = false;
						});
					});

					for (const type in this.$$l) {
						for (const listener of this.$$l[type]) {
							const unsub = this.$$c.$on(type, listener);
							this.$$l_u.set(listener, unsub);
						}
					}
					this.$$l = {};
				}
			}

			// We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
			// and setting attributes through setAttribute etc, this is helpful

			/**
			 * @param {string} attr
			 * @param {string} _oldValue
			 * @param {string} newValue
			 */
			attributeChangedCallback(attr, _oldValue, newValue) {
				if (this.$$r) return;
				attr = this.$$g_p(attr);
				this.$$d[attr] = get_custom_element_value(attr, newValue, this.$$p_d, 'toProp');
				this.$$c?.$set({ [attr]: this.$$d[attr] });
			}

			disconnectedCallback() {
				this.$$cn = false;
				// In a microtask, because this could be a move within the DOM
				Promise.resolve().then(() => {
					if (!this.$$cn && this.$$c) {
						this.$$c.$destroy();
						this.$$me();
						this.$$c = undefined;
					}
				});
			}

			/**
			 * @param {string} attribute_name
			 */
			$$g_p(attribute_name) {
				return (
					object_keys(this.$$p_d).find(
						(key) =>
							this.$$p_d[key].attribute === attribute_name ||
							(!this.$$p_d[key].attribute && key.toLowerCase() === attribute_name)
					) || attribute_name
				);
			}
		};
	}

	/**
	 * @param {string} prop
	 * @param {any} value
	 * @param {Record<string, CustomElementPropDefinition>} props_definition
	 * @param {'toAttribute' | 'toProp'} [transform]
	 */
	function get_custom_element_value(prop, value, props_definition, transform) {
		const type = props_definition[prop]?.type;
		value = type === 'Boolean' && typeof value !== 'boolean' ? value != null : value;
		if (!transform || !props_definition[prop]) {
			return value;
		} else if (transform === 'toAttribute') {
			switch (type) {
				case 'Object':
				case 'Array':
					return value == null ? null : JSON.stringify(value);
				case 'Boolean':
					return value ? '' : null;
				case 'Number':
					return value == null ? null : value;
				default:
					return value;
			}
		} else {
			switch (type) {
				case 'Object':
				case 'Array':
					return value && JSON.parse(value);
				case 'Boolean':
					return value; // conversion already handled above
				case 'Number':
					return value != null ? +value : value;
				default:
					return value;
			}
		}
	}

	/**
	 * @param {HTMLElement} element
	 */
	function get_custom_elements_slots(element) {
		/** @type {Record<string, true>} */
		const result = {};
		element.childNodes.forEach((node) => {
			result[/** @type {Element} node */ (node).slot || 'default'] = true;
		});
		return result;
	}

	/**
	 * @internal
	 *
	 * Turn a Svelte component into a custom element.
	 * @param {any} Component  A Svelte component function
	 * @param {Record<string, CustomElementPropDefinition>} props_definition  The props to observe
	 * @param {string[]} slots  The slots to create
	 * @param {string[]} exports  Explicitly exported values, other than props
	 * @param {boolean} use_shadow_dom  Whether to use shadow DOM
	 * @param {(ce: new () => HTMLElement) => new () => HTMLElement} [extend]
	 */
	function create_custom_element(
		Component,
		props_definition,
		slots,
		exports,
		use_shadow_dom,
		extend
	) {
		let Class = class extends SvelteElement {
			constructor() {
				super(Component, slots, use_shadow_dom);
				this.$$p_d = props_definition;
			}
			static get observedAttributes() {
				return object_keys(props_definition).map((key) =>
					(props_definition[key].attribute || key).toLowerCase()
				);
			}
		};
		object_keys(props_definition).forEach((prop) => {
			define_property(Class.prototype, prop, {
				get() {
					return this.$$c && prop in this.$$c ? this.$$c[prop] : this.$$d[prop];
				},
				set(value) {
					value = get_custom_element_value(prop, value, props_definition);
					this.$$d[prop] = value;
					var component = this.$$c;

					if (component) {
						// // If the instance has an accessor, use that instead
						var setter = get_descriptor(component, prop)?.get;

						if (setter) {
							component[prop] = value;
						} else {
							component.$set({ [prop]: value });
						}
					}
				}
			});
		});
		exports.forEach((property) => {
			define_property(Class.prototype, property, {
				get() {
					return this.$$c?.[property];
				}
			});
		});
		Component.element = /** @type {any} */ Class;
		return Class;
	}

	/**
	 * Manages persistence of custom views state using browser localStorage
	 */
	class PersistenceManager {
	    // Storage keys for localStorage
	    static STORAGE_KEYS = {
	        STATE: 'customviews-state',
	        TAB_NAV_VISIBILITY: 'cv-tab-navs-visible'
	    };
	    /**
	     * Check if localStorage is available in the current environment
	     */
	    isStorageAvailable() {
	        return typeof window !== 'undefined' && window.localStorage !== undefined;
	    }
	    persistState(state) {
	        if (!this.isStorageAvailable())
	            return;
	        try {
	            localStorage.setItem(PersistenceManager.STORAGE_KEYS.STATE, JSON.stringify(state));
	        }
	        catch (error) {
	            console.warn('Failed to persist state:', error);
	        }
	    }
	    getPersistedState() {
	        if (!this.isStorageAvailable())
	            return null;
	        try {
	            const raw = localStorage.getItem(PersistenceManager.STORAGE_KEYS.STATE);
	            return raw ? JSON.parse(raw) : null;
	        }
	        catch (error) {
	            console.warn('Failed to parse persisted state:', error);
	            return null;
	        }
	    }
	    /**
	     * Clear persisted state
	     */
	    clearAll() {
	        if (!this.isStorageAvailable())
	            return;
	        localStorage.removeItem(PersistenceManager.STORAGE_KEYS.STATE);
	        localStorage.removeItem(PersistenceManager.STORAGE_KEYS.TAB_NAV_VISIBILITY);
	    }
	    /**
	     * Persist tab nav visibility preference
	     */
	    persistTabNavVisibility(visible) {
	        if (!this.isStorageAvailable())
	            return;
	        try {
	            localStorage.setItem(PersistenceManager.STORAGE_KEYS.TAB_NAV_VISIBILITY, visible ? 'true' : 'false');
	        }
	        catch (error) {
	            console.warn('Failed to persist tab nav visibility:', error);
	        }
	    }
	    /**
	     * Get persisted tab nav visibility preference
	     */
	    getPersistedTabNavVisibility() {
	        if (!this.isStorageAvailable())
	            return null;
	        try {
	            const raw = localStorage.getItem(PersistenceManager.STORAGE_KEYS.TAB_NAV_VISIBILITY);
	            return raw === null ? null : raw === 'true';
	        }
	        catch (error) {
	            console.warn('Failed to get persisted tab nav visibility:', error);
	            return null;
	        }
	    }
	    /**
	     * Check if any persistence data exists
	     */
	    hasPersistedData() {
	        if (!this.isStorageAvailable()) {
	            return false;
	        }
	        return !!this.getPersistedState();
	    }
	}

	/**
	 * URL State Manager for CustomViews
	 * Handles encoding/decoding of states in URL parameters
	 */
	class URLStateManager {
	    /**
	     * Parse current URL parameters into state object
	     */
	    static parseURL() {
	        const urlParams = new URLSearchParams(window.location.search);
	        // Get view state
	        const viewParam = urlParams.get('view');
	        let decoded = null;
	        if (viewParam) {
	            try {
	                decoded = this.decodeState(viewParam);
	            }
	            catch (error) {
	                console.warn('Failed to decode view state from URL:', error);
	            }
	        }
	        return decoded;
	    }
	    /**
	     * Update URL with current state without triggering navigation
	     */
	    static updateURL(state) {
	        if (typeof window === 'undefined' || !window.history)
	            return;
	        const url = new URL(window.location.href);
	        // Clear existing parameters
	        url.searchParams.delete('view');
	        // Set view state
	        if (state) {
	            const encoded = this.encodeState(state);
	            if (encoded) {
	                url.searchParams.set('view', encoded);
	            }
	        }
	        // Use a relative URL to satisfy stricter environments (e.g., jsdom tests)
	        const relative = url.pathname + (url.search || '') + (url.hash || '');
	        window.history.replaceState({}, '', relative);
	    }
	    /**
	     * Clear all state parameters from URL
	     */
	    static clearURL() {
	        this.updateURL(null);
	    }
	    /**
	     * Generate shareable URL for current state
	     */
	    static generateShareableURL(state) {
	        const url = new URL(window.location.href);
	        // Clear existing parameters
	        url.searchParams.delete('view');
	        // Set new parameters
	        if (state) {
	            const encoded = this.encodeState(state);
	            if (encoded) {
	                url.searchParams.set('view', encoded);
	            }
	        }
	        return url.toString();
	    }
	    /**
	     * Encode state into URL-safe string
	     *
	     * (Covers Toggles, Tabs and Focus currently)
	     */
	    static encodeState(state) {
	        try {
	            // Create a compact representation
	            const compact = {};
	            // Add toggles if present and non-empty
	            if (state.shownToggles && state.shownToggles.length > 0) {
	                compact.t = state.shownToggles;
	            }
	            // Add peek toggles if present and non-empty
	            if (state.peekToggles && state.peekToggles.length > 0) {
	                compact.p = state.peekToggles;
	            }
	            // Add tab groups if present
	            if (state.tabs && Object.keys(state.tabs).length > 0) {
	                compact.g = Object.entries(state.tabs);
	            }
	            // Add focus if present
	            if (state.focus && state.focus.length > 0) {
	                compact.f = state.focus;
	            }
	            // Convert to JSON and encode
	            const json = JSON.stringify(compact);
	            let encoded;
	            if (typeof btoa === 'function') {
	                encoded = btoa(json);
	            }
	            else {
	                // Node/test fallback
	                // @ts-ignore
	                encoded = Buffer.from(json, 'utf-8').toString('base64');
	            }
	            // Make URL-safe
	            const urlSafeString = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
	            return urlSafeString;
	        }
	        catch (error) {
	            console.warn('Failed to encode state:', error);
	            return null;
	        }
	    }
	    /**
	     * Decode custom state from URL parameter
	     *
	     * (Covers Toggles, Tabs and Focus currently)
	     */
	    static decodeState(encoded) {
	        try {
	            // Restore base64 padding and characters
	            let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
	            // Add padding if needed
	            while (base64.length % 4) {
	                base64 += '=';
	            }
	            // Decode and parse
	            let json;
	            if (typeof atob === 'function') {
	                json = atob(base64);
	            }
	            else {
	                // Node/test fallback
	                // @ts-ignore
	                json = Buffer.from(base64, 'base64').toString('utf-8');
	            }
	            const compact = JSON.parse(json);
	            // Validate structure
	            if (!compact || typeof compact !== 'object') {
	                throw new Error('Invalid compact state structure');
	            }
	            // Reconstruct State from compact format
	            // Reconstruct Toggles
	            const state = {
	                shownToggles: Array.isArray(compact.t) ? compact.t : [],
	                peekToggles: Array.isArray(compact.p) ? compact.p : []
	            };
	            // Reconstruct Tabs
	            if (Array.isArray(compact.g)) {
	                state.tabs = {};
	                for (const [groupId, tabId] of compact.g) {
	                    if (typeof groupId === 'string' && typeof tabId === 'string') {
	                        state.tabs[groupId] = tabId;
	                    }
	                }
	            }
	            // Reconstruct Focus
	            if (Array.isArray(compact.f)) {
	                state.focus = compact.f;
	            }
	            return state;
	        }
	        catch (error) {
	            console.warn('Failed to decode view state:', error);
	            return null;
	        }
	    }
	}

	/* focus-store.svelte.ts generated by Svelte v5.46.1 */

	class FocusStore {
		#isActive = state(false);

		get isActive() {
			return get(this.#isActive);
		}

		set isActive(value) {
			set(this.#isActive, value, true);
		}

		setIsActive(isActive) {
			this.isActive = isActive;
		}

		/**
		 * Signals intent to exit focus mode.
		 * Logic is handled by the service observing this state.
		 */
		exit() {
			this.isActive = false;
		}
	}

	const focusStore = new FocusStore();

	/* toast-store.svelte.ts generated by Svelte v5.46.1 */

	const TOAST_CLASS = 'cv-toast-notification';

	class ToastStore {
		#items = state(proxy([]));

		get items() {
			return get(this.#items);
		}

		set items(value) {
			set(this.#items, value, true);
		}

		nextId = 0;

		show(message, duration = 2500) {
			const id = this.nextId++;
			const toast = { message, duration, id };

			this.items.push(toast);

			if (duration > 0) {
				setTimeout(
					() => {
						this.dismiss(id);
					},
					duration
				);
			}
		}

		dismiss(id) {
			this.items = this.items.filter((t) => t.id !== id);
		}
	}

	const toast = new ToastStore();

	function showToast(message, duration) {
		toast.show(message, duration);
	}

	/**
	 * Generates a simple hash code for a string.
	 */
	function hashCode(str) {
	    let hash = 0;
	    if (str.length === 0)
	        return hash;
	    for (let i = 0; i < str.length; i++) {
	        const char = str.charCodeAt(i);
	        hash = ((hash << 5) - hash) + char;
	        hash = hash & hash; // Convert to 32bit integer
	    }
	    return hash;
	}
	/**
	 * Normalizes text content by removing excessive whitespace.
	 */
	function normalizeText(text) {
	    return text.trim().replace(/\s+/g, ' ');
	}
	/**
	 * Creates an AnchorDescriptor for a given DOM element.
	 */
	function createDescriptor(el) {
	    const tag = el.tagName;
	    const textContent = el.textContent || "";
	    const normalizedText = normalizeText(textContent);
	    // Find nearest parent with an ID
	    let parentId;
	    let parent = el.parentElement;
	    while (parent) {
	        if (parent.id) {
	            parentId = parent.id;
	            break;
	        }
	        parent = parent.parentElement;
	    }
	    // Calculate index relative to the container
	    const container = parent || document.body;
	    const siblings = Array.from(container.querySelectorAll(tag));
	    const index = siblings.indexOf(el);
	    const descriptor = {
	        tag,
	        index: index !== -1 ? index : 0,
	        textSnippet: normalizedText.substring(0, 32),
	        textHash: hashCode(normalizedText),
	        elementId: el.id
	    };
	    if (parentId) {
	        descriptor.parentId = parentId;
	    }
	    return descriptor;
	}
	/**
	 * Serializes a list of AnchorDescriptors into a URL-safe string.
	 */
	function serialize(descriptors) {
	    // Check if we can use human-readable format that only uses IDs
	    // AnchorDescriptor carries the element's OWN id optionally.
	    const minified = descriptors.map(d => ({
	        t: d.tag,
	        i: d.index,
	        p: d.parentId,
	        s: d.textSnippet,
	        h: d.textHash,
	        id: d.elementId
	    }));
	    // Check if all have IDs, use human-readable format
	    const allHaveIds = minified.every(m => !!m.id);
	    if (allHaveIds) {
	        return minified.map(m => m.id).join(',');
	    }
	    const json = JSON.stringify(minified);
	    // Modern UTF-8 safe Base64 encoding
	    try {
	        const bytes = new TextEncoder().encode(json);
	        const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
	        return btoa(binString);
	    }
	    catch (e) {
	        console.error("Failed to encode anchor:", e);
	        throw new Error("Failed to generate link signature.");
	    }
	}
	/**
	 * Deserializes a URL-safe string back into a list of AnchorDescriptors.
	 */
	function deserialize(encoded) {
	    if (!encoded)
	        return [];
	    // Heuristic: If it contains spaces, it's definitely a list of IDs (Base64 doesn't have spaces)
	    if (encoded.includes(' ')) {
	        return parseIds(encoded);
	    }
	    // Heuristic: Check for characters invalid in standard Base64 (btoa uses +/)
	    // Common IDs use - or _ or . which are not in Base64
	    const isBase64Candidate = /^[A-Za-z0-9+/]*={0,2}$/.test(encoded);
	    if (!isBase64Candidate) {
	        return parseIds(encoded);
	    }
	    try {
	        // Modern UTF-8 safe Base64 decoding
	        const binString = atob(encoded);
	        const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0) || 0);
	        const json = new TextDecoder().decode(bytes);
	        const minified = JSON.parse(json);
	        // Robustness: Ensure result is an array
	        if (!Array.isArray(minified)) {
	            throw new Error("Decoded JSON is not an array");
	        }
	        return minified.map((m) => {
	            // Robustness: Ensure item is an object
	            if (typeof m !== 'object' || m === null)
	                throw new Error("Item is not an object");
	            return {
	                tag: m.t,
	                index: m.i,
	                parentId: m.p,
	                textSnippet: m.s,
	                textHash: m.h,
	                elementId: m.id
	            };
	        });
	    }
	    catch (e) {
	        // This handles cases where an ID string happens to look like Base64 but does not match the expected schema
	        return parseIds(encoded);
	    }
	}
	/**
	 * Parses a space-separated, plus-separated, or comma-separated list of IDs into a list of AnchorDescriptors.
	 */
	function parseIds(encoded) {
	    const parts = encoded.split(/[ +,]+/).filter(p => p.length > 0);
	    return parts.map(id => ({
	        tag: 'ANY',
	        index: 0,
	        textSnippet: '',
	        textHash: 0,
	        elementId: id
	    }));
	}
	const SCORE_EXACT_HASH = 50;
	const SCORE_SNIPPET_START = 30;
	const SCORE_INDEX_MATCH = 10;
	const SCORE_PERFECT = 60;
	const SCORE_THRESHOLD = 30;
	/**
	 * Finds the best DOM element match(es) for a descriptor.
	 * Returns an array of elements. For specific descriptors, usually contains 0 or 1 element.
	 * For ID-only descriptors (tag='ANY'), may return multiple if duplicates exist.
	 */
	function resolve(root, descriptor) {
	    // 0. Direct ID Shortcut
	    if (descriptor.elementId) {
	        // Always support duplicate IDs for consistency, even if technically invalid HTML.
	        const all = document.querySelectorAll(`[id="${CSS.escape(descriptor.elementId)}"]`);
	        if (all.length > 0)
	            return Array.from(all);
	        // If not found by ID (and it's a manual ID-only request), stop search.
	        if (descriptor.tag === 'ANY')
	            return [];
	    }
	    // 1. Determine Scope
	    let scope = root;
	    // Optimization: If parentId exists, try to narrow scope immediately
	    if (descriptor.parentId) {
	        const foundParent = root.querySelector(`#${descriptor.parentId}`);
	        if (foundParent instanceof HTMLElement) {
	            scope = foundParent;
	        }
	        else {
	            const globalParent = document.getElementById(descriptor.parentId);
	            if (globalParent) {
	                scope = globalParent;
	            }
	        }
	    }
	    // 2. Candidate Search & Scoring
	    const candidates = scope.querySelectorAll(descriptor.tag);
	    // Optimization: Structural Check First (Fastest)
	    // If we trust the structure hasn't changed, the element at the specific index 
	    // is effectively O(1) access if we assume `querySelectorAll` order is stable.
	    if (candidates[descriptor.index]) {
	        const candidate = candidates[descriptor.index];
	        const text = normalizeText(candidate.textContent || "");
	        // Perfect Match Check: If index + hash match, it's virtually guaranteed.
	        // This avoids checking every other candidate.
	        if (hashCode(text) === descriptor.textHash) {
	            return [candidate];
	        }
	    }
	    // Fallback: Full scan if structural match failed (element moved/deleted/inserted)
	    let bestMatch = null;
	    let highestScore = 0;
	    // Use loop with break ability for optimization
	    for (let i = 0; i < candidates.length; i++) {
	        const candidate = candidates[i];
	        let score = 0;
	        const text = normalizeText(candidate.textContent || "");
	        // Content Match
	        if (hashCode(text) === descriptor.textHash) {
	            score += SCORE_EXACT_HASH;
	        }
	        else if (text.startsWith(descriptor.textSnippet)) {
	            score += SCORE_SNIPPET_START;
	        }
	        // Structural Match (Re-calculated index)
	        if (i === descriptor.index) {
	            score += SCORE_INDEX_MATCH;
	        }
	        // Early Exit: If we find a very high score (Hash + Index), we can stop.
	        if (score >= SCORE_PERFECT) {
	            return [candidate];
	        }
	        if (score > highestScore) {
	            highestScore = score;
	            bestMatch = candidate;
	        }
	    }
	    // Threshold check
	    return highestScore > SCORE_THRESHOLD && bestMatch ? [bestMatch] : [];
	}

	// generated during release, do not modify

	const PUBLIC_VERSION = '5';

	if (typeof window !== 'undefined') {
		// @ts-expect-error
		((window.__svelte ??= {}).v ??= new Set()).add(PUBLIC_VERSION);
	}

	var root$c = from_html(`<div class="cv-context-divider svelte-1x6h5hk" role="button" tabindex="0"> </div>`);

	const $$css$h = {
		hash: 'svelte-1x6h5hk',
		code: '.cv-context-divider.svelte-1x6h5hk {padding:12px;margin:16px 0;background-color:#f8f8f8;border-top:1px dashed #ccc;border-bottom:1px dashed #ccc;color:#555;text-align:center;cursor:pointer;font-family:system-ui, sans-serif;font-size:13px;transition:background-color 0.2s;}.cv-context-divider.svelte-1x6h5hk:hover {background-color:#e8e8e8;color:#333;}'
	};

	function FocusDivider($$anchor, $$props) {
		push($$props, true);
		append_styles$1($$anchor, $$css$h);

		// Component is mounted manually via `mount`, use props for communication.
		let hiddenCount = prop($$props, 'hiddenCount', 3, 0);

		function handleClick() {
			if ($$props.onExpand) $$props.onExpand();
		}

		var div = root$c();

		div.__click = handleClick;
		div.__keydown = (e) => e.key === 'Enter' && handleClick();

		var text = child(div);

		reset(div);
		template_effect(() => set_text(text, `... ${hiddenCount() ?? ''} section${hiddenCount() > 1 ? 's' : ''} hidden (Click to expand) ...`));
		append($$anchor, div);
		pop();
	}

	delegate(['click', 'keydown']);

	/** @import { Source } from '#client' */

	var read_methods = ['forEach', 'isDisjointFrom', 'isSubsetOf', 'isSupersetOf'];
	var set_like_methods = ['difference', 'intersection', 'symmetricDifference', 'union'];

	var inited = false;

	/**
	 * A reactive version of the built-in [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) object.
	 * Reading contents of the set (by iterating, or by reading `set.size` or calling `set.has(...)` as in the [example](https://svelte.dev/playground/53438b51194b4882bcc18cddf9f96f15) below) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
	 * will cause it to be re-evaluated as necessary when the set is updated.
	 *
	 * Note that values in a reactive set are _not_ made [deeply reactive](https://svelte.dev/docs/svelte/$state#Deep-state).
	 *
	 * ```svelte
	 * <script>
	 * 	import { SvelteSet } from 'svelte/reactivity';
	 * 	let monkeys = new SvelteSet();
	 *
	 * 	function toggle(monkey) {
	 * 		if (monkeys.has(monkey)) {
	 * 			monkeys.delete(monkey);
	 * 		} else {
	 * 			monkeys.add(monkey);
	 * 		}
	 * 	}
	 * </script>
	 *
	 * {#each ['🙈', '🙉', '🙊'] as monkey}
	 * 	<button onclick={() => toggle(monkey)}>{monkey}</button>
	 * {/each}
	 *
	 * <button onclick={() => monkeys.clear()}>clear</button>
	 *
	 * {#if monkeys.has('🙈')}<p>see no evil</p>{/if}
	 * {#if monkeys.has('🙉')}<p>hear no evil</p>{/if}
	 * {#if monkeys.has('🙊')}<p>speak no evil</p>{/if}
	 * ```
	 *
	 * @template T
	 * @extends {Set<T>}
	 */
	class SvelteSet extends Set {
		/** @type {Map<T, Source<boolean>>} */
		#sources = new Map();
		#version = state(0);
		#size = state(0);
		#update_version = update_version || -1;

		/**
		 * @param {Iterable<T> | null | undefined} [value]
		 */
		constructor(value) {
			super();

			if (value) {
				for (var element of value) {
					super.add(element);
				}
				this.#size.v = super.size;
			}

			if (!inited) this.#init();
		}

		/**
		 * If the source is being created inside the same reaction as the SvelteSet instance,
		 * we use `state` so that it will not be a dependency of the reaction. Otherwise we
		 * use `source` so it will be.
		 *
		 * @template T
		 * @param {T} value
		 * @returns {Source<T>}
		 */
		#source(value) {
			return update_version === this.#update_version ? state(value) : source(value);
		}

		// We init as part of the first instance so that we can treeshake this class
		#init() {
			inited = true;

			var proto = SvelteSet.prototype;
			var set_proto = Set.prototype;

			for (const method of read_methods) {
				// @ts-ignore
				proto[method] = function (...v) {
					get(this.#version);
					// @ts-ignore
					return set_proto[method].apply(this, v);
				};
			}

			for (const method of set_like_methods) {
				// @ts-ignore
				proto[method] = function (...v) {
					get(this.#version);
					// @ts-ignore
					var set = /** @type {Set<T>} */ (set_proto[method].apply(this, v));
					return new SvelteSet(set);
				};
			}
		}

		/** @param {T} value */
		has(value) {
			var has = super.has(value);
			var sources = this.#sources;
			var s = sources.get(value);

			if (s === undefined) {
				if (!has) {
					// If the value doesn't exist, track the version in case it's added later
					// but don't create sources willy-nilly to track all possible values
					get(this.#version);
					return false;
				}

				s = this.#source(true);

				sources.set(value, s);
			}

			get(s);
			return has;
		}

		/** @param {T} value */
		add(value) {
			if (!super.has(value)) {
				super.add(value);
				set(this.#size, super.size);
				increment(this.#version);
			}

			return this;
		}

		/** @param {T} value */
		delete(value) {
			var deleted = super.delete(value);
			var sources = this.#sources;
			var s = sources.get(value);

			if (s !== undefined) {
				sources.delete(value);
				set(s, false);
			}

			if (deleted) {
				set(this.#size, super.size);
				increment(this.#version);
			}

			return deleted;
		}

		clear() {
			if (super.size === 0) {
				return;
			}
			// Clear first, so we get nice console.log outputs with $inspect
			super.clear();
			var sources = this.#sources;

			for (var s of sources.values()) {
				set(s, false);
			}

			sources.clear();
			set(this.#size, 0);
			increment(this.#version);
		}

		keys() {
			return this.values();
		}

		values() {
			get(this.#version);
			return super.values();
		}

		entries() {
			get(this.#version);
			return super.entries();
		}

		[Symbol.iterator]() {
			return this.keys();
		}

		get size() {
			return get(this.#size);
		}
	}

	const REPLACE = Symbol();

	/**
	 * A reactive version of the built-in [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) object.
	 * Reading its contents (by iterating, or by calling `params.get(...)` or `params.getAll(...)` as in the [example](https://svelte.dev/playground/b3926c86c5384bab9f2cf993bc08c1c8) below) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
	 * will cause it to be re-evaluated as necessary when the params are updated.
	 *
	 * ```svelte
	 * <script>
	 * 	import { SvelteURLSearchParams } from 'svelte/reactivity';
	 *
	 * 	const params = new SvelteURLSearchParams('message=hello');
	 *
	 * 	let key = $state('key');
	 * 	let value = $state('value');
	 * </script>
	 *
	 * <input bind:value={key} />
	 * <input bind:value={value} />
	 * <button onclick={() => params.append(key, value)}>append</button>
	 *
	 * <p>?{params.toString()}</p>
	 *
	 * {#each params as [key, value]}
	 * 	<p>{key}: {value}</p>
	 * {/each}
	 * ```
	 */
	class SvelteURLSearchParams extends URLSearchParams {
		#version = state(0);
		#url = get_current_url();

		#updating = false;

		#update_url() {
			if (!this.#url || this.#updating) return;
			this.#updating = true;

			const search = this.toString();
			this.#url.search = search && `?${search}`;

			this.#updating = false;
		}

		/**
		 * @param {URLSearchParams} params
		 * @internal
		 */
		[REPLACE](params) {
			if (this.#updating) return;
			this.#updating = true;

			for (const key of [...super.keys()]) {
				super.delete(key);
			}

			for (const [key, value] of params) {
				super.append(key, value);
			}

			increment(this.#version);
			this.#updating = false;
		}

		/**
		 * @param {string} name
		 * @param {string} value
		 * @returns {void}
		 */
		append(name, value) {
			super.append(name, value);
			this.#update_url();
			increment(this.#version);
		}

		/**
		 * @param {string} name
		 * @param {string=} value
		 * @returns {void}
		 */
		delete(name, value) {
			var has_value = super.has(name, value);
			super.delete(name, value);
			if (has_value) {
				this.#update_url();
				increment(this.#version);
			}
		}

		/**
		 * @param {string} name
		 * @returns {string|null}
		 */
		get(name) {
			get(this.#version);
			return super.get(name);
		}

		/**
		 * @param {string} name
		 * @returns {string[]}
		 */
		getAll(name) {
			get(this.#version);
			return super.getAll(name);
		}

		/**
		 * @param {string} name
		 * @param {string=} value
		 * @returns {boolean}
		 */
		has(name, value) {
			get(this.#version);
			return super.has(name, value);
		}

		keys() {
			get(this.#version);
			return super.keys();
		}

		/**
		 * @param {string} name
		 * @param {string} value
		 * @returns {void}
		 */
		set(name, value) {
			var previous = super.getAll(name).join('');
			super.set(name, value);
			// can't use has(name, value), because for something like https://svelte.dev?foo=1&bar=2&foo=3
			// if you set `foo` to 1, then foo=3 gets deleted whilst `has("foo", "1")` returns true
			if (previous !== super.getAll(name).join('')) {
				this.#update_url();
				increment(this.#version);
			}
		}

		sort() {
			super.sort();
			this.#update_url();
			increment(this.#version);
		}

		toString() {
			get(this.#version);
			return super.toString();
		}

		values() {
			get(this.#version);
			return super.values();
		}

		entries() {
			get(this.#version);
			return super.entries();
		}

		[Symbol.iterator]() {
			return this.entries();
		}

		get size() {
			get(this.#version);
			return super.size;
		}
	}

	/** @type {SvelteURL | null} */
	let current_url = null;

	function get_current_url() {
		// ideally we'd just export `current_url` directly, but it seems Vitest doesn't respect live bindings
		return current_url;
	}

	/**
	 * A reactive version of the built-in [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) object.
	 * Reading properties of the URL (such as `url.href` or `url.pathname`) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
	 * will cause it to be re-evaluated as necessary when the URL changes.
	 *
	 * The `searchParams` property is an instance of [SvelteURLSearchParams](https://svelte.dev/docs/svelte/svelte-reactivity#SvelteURLSearchParams).
	 *
	 * [Example](https://svelte.dev/playground/5a694758901b448c83dc40dc31c71f2a):
	 *
	 * ```svelte
	 * <script>
	 * 	import { SvelteURL } from 'svelte/reactivity';
	 *
	 * 	const url = new SvelteURL('https://example.com/path');
	 * </script>
	 *
	 * <!-- changes to these... -->
	 * <input bind:value={url.protocol} />
	 * <input bind:value={url.hostname} />
	 * <input bind:value={url.pathname} />
	 *
	 * <hr />
	 *
	 * <!-- will update `href` and vice versa -->
	 * <input bind:value={url.href} size="65" />
	 * ```
	 */
	class SvelteURL extends URL {
		#protocol = state(super.protocol);
		#username = state(super.username);
		#password = state(super.password);
		#hostname = state(super.hostname);
		#port = state(super.port);
		#pathname = state(super.pathname);
		#hash = state(super.hash);
		#search = state(super.search);
		#searchParams;

		/**
		 * @param {string | URL} url
		 * @param {string | URL} [base]
		 */
		constructor(url, base) {
			url = new URL(url, base);
			super(url);

			current_url = this;
			this.#searchParams = new SvelteURLSearchParams(url.searchParams);
			current_url = null;
		}

		get hash() {
			return get(this.#hash);
		}

		set hash(value) {
			super.hash = value;
			set(this.#hash, super.hash);
		}

		get host() {
			get(this.#hostname);
			get(this.#port);
			return super.host;
		}

		set host(value) {
			super.host = value;
			set(this.#hostname, super.hostname);
			set(this.#port, super.port);
		}

		get hostname() {
			return get(this.#hostname);
		}

		set hostname(value) {
			super.hostname = value;
			set(this.#hostname, super.hostname);
		}

		get href() {
			get(this.#protocol);
			get(this.#username);
			get(this.#password);
			get(this.#hostname);
			get(this.#port);
			get(this.#pathname);
			get(this.#hash);
			get(this.#search);
			return super.href;
		}

		set href(value) {
			super.href = value;
			set(this.#protocol, super.protocol);
			set(this.#username, super.username);
			set(this.#password, super.password);
			set(this.#hostname, super.hostname);
			set(this.#port, super.port);
			set(this.#pathname, super.pathname);
			set(this.#hash, super.hash);
			set(this.#search, super.search);
			this.#searchParams[REPLACE](super.searchParams);
		}

		get password() {
			return get(this.#password);
		}

		set password(value) {
			super.password = value;
			set(this.#password, super.password);
		}

		get pathname() {
			return get(this.#pathname);
		}

		set pathname(value) {
			super.pathname = value;
			set(this.#pathname, super.pathname);
		}

		get port() {
			return get(this.#port);
		}

		set port(value) {
			super.port = value;
			set(this.#port, super.port);
		}

		get protocol() {
			return get(this.#protocol);
		}

		set protocol(value) {
			super.protocol = value;
			set(this.#protocol, super.protocol);
		}

		get search() {
			return get(this.#search);
		}

		set search(value) {
			super.search = value;
			set(this.#search, value);
			this.#searchParams[REPLACE](super.searchParams);
		}

		get username() {
			return get(this.#username);
		}

		set username(value) {
			super.username = value;
			set(this.#username, super.username);
		}

		get origin() {
			get(this.#protocol);
			get(this.#hostname);
			get(this.#port);
			return super.origin;
		}

		get searchParams() {
			return this.#searchParams;
		}

		toString() {
			return this.href;
		}

		toJSON() {
			return this.href;
		}
	}

	/**
	 * Calculates the height of a fixed or sticky header, if present.
	 * This is used to offset scroll positions so content isn't hidden behind the header.
	 */
	function getHeaderOffset() {
	    const headerEl = document.querySelector('header');
	    if (!headerEl)
	        return 0;
	    const headerStyle = window.getComputedStyle(headerEl);
	    const isHeaderFixedOrSticky = ['fixed', 'sticky'].includes(headerStyle.position);
	    return isHeaderFixedOrSticky ? headerEl.getBoundingClientRect().height : 0;
	}
	/**
	 * Finds the highest element matching the selector that is currently in the viewport.
	 * @param selector The CSS selector to match elements against.
	 * @returns The HTMLElement of the highest visible element, or null if none are found.
	 */
	function findHighestVisibleElement(selector) {
	    const headerOffset = getHeaderOffset();
	    const contentTop = headerOffset; // Viewport-relative position where content begins.
	    // 1. Find all matching elements, filtering out any inside the main header (if fixed/sticky).
	    const allElements = Array.from(document.querySelectorAll(selector));
	    const headerEl = document.querySelector('header');
	    const candidateElements = allElements.filter(el => {
	        // If header is sticky/fixed, ignore elements inside it to avoid false positives
	        if (headerOffset > 0 && headerEl && el.closest('header') === headerEl) {
	            return false;
	        }
	        return true;
	    });
	    // 2. Find the highest element visible in the content area.
	    let highestVisibleEl = null;
	    let highestVisibleTop = Infinity;
	    for (const el of candidateElements) {
	        const rect = el.getBoundingClientRect();
	        // Visible if not completely above content area and not completely below viewport
	        const isVisibleInContentArea = rect.bottom > contentTop && rect.top < window.innerHeight;
	        if (isVisibleInContentArea) {
	            // We want the one closest to the top
	            if (rect.top < highestVisibleTop) {
	                highestVisibleEl = el;
	                highestVisibleTop = rect.top;
	            }
	        }
	    }
	    return highestVisibleEl;
	}
	/**
	 * Scrolls the page to align the element to the top of the viewport,
	 * accounting for fixed/sticky headers and adding some padding.
	 * @param element The element to scroll to.
	 */
	function scrollToElement(element) {
	    const headerOffset = getHeaderOffset();
	    const PADDING_BELOW_HEADER = 20;
	    const targetElementRect = element.getBoundingClientRect();
	    const scrollTargetY = targetElementRect.top + window.scrollY;
	    const finalScrollY = scrollTargetY - headerOffset - PADDING_BELOW_HEADER;
	    window.scrollTo({
	        top: finalScrollY,
	        behavior: 'smooth',
	    });
	}

	var root_1$a = from_html(`<div class="cv-highlight-box svelte-1fie5i7"></div> <div> </div>`, 1);
	var root$b = from_html(`<div class="cv-highlight-overlay svelte-1fie5i7"></div>`);

	const $$css$g = {
		hash: 'svelte-1fie5i7',
		code: '.cv-highlight-overlay.svelte-1fie5i7 {position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:8000;overflow:visible;}.cv-highlight-box.svelte-1fie5i7 {position:absolute;border:4px solid #d13438;\n    /* Layer 1: Sharp/Close, Layer 2: Soft/Deep */box-shadow:0 5px 10px rgba(0, 0, 0, 0.1), \n      0 15px 35px rgba(0, 0, 0, 0.15);pointer-events:none;}.cv-highlight-arrow.svelte-1fie5i7 {position:absolute;font-size:30px;color:#d13438;font-weight:bold;width:30px;height:30px;line-height:30px;text-align:center;filter:drop-shadow(5px 5px 5px rgba(0, 0, 0, 0.5));}.cv-highlight-arrow.left.svelte-1fie5i7 { animation: svelte-1fie5i7-floatArrowLeft 1.5s infinite;}.cv-highlight-arrow.right.svelte-1fie5i7 { animation: svelte-1fie5i7-floatArrowRight 1.5s infinite;}.cv-highlight-arrow.top.svelte-1fie5i7 { animation: svelte-1fie5i7-floatArrowTop 1.5s infinite;}.cv-highlight-arrow.bottom.svelte-1fie5i7 { animation: svelte-1fie5i7-floatArrowBottom 1.5s infinite;}\n\n  @keyframes svelte-1fie5i7-floatArrowLeft {\n      0%, 100% { transform: translateX(0); }\n      50% { transform: translateX(-10px); }\n  }\n  @keyframes svelte-1fie5i7-floatArrowRight {\n      0%, 100% { transform: translateX(0); }\n      50% { transform: translateX(10px); }\n  }\n  @keyframes svelte-1fie5i7-floatArrowTop {\n      0%, 100% { transform: translate(-50%, 0); }\n      50% { transform: translate(-50%, -10px); }\n  }\n  @keyframes svelte-1fie5i7-floatArrowBottom {\n      0%, 100% { transform: translate(-50%, 0); }\n      50% { transform: translate(-50%, 10px); }\n  }'
	};

	function HighlightOverlay($$anchor, $$props) {
		push($$props, true);
		append_styles$1($$anchor, $$css$g);

		let rects = user_derived(() => $$props.box.rects);

		function getArrowClass(rect) {
			const viewportWidth = window.innerWidth;
			const rectLeftViewport = rect.left - (window.pageXOffset || document.documentElement.scrollLeft);

			if (rectLeftViewport >= 50) return 'left';
			if (viewportWidth - (rectLeftViewport + rect.width) >= 50) return 'right';
			if (rect.top - (window.pageYOffset || document.documentElement.scrollTop) >= 50) return 'top';

			return 'bottom';
		}

		function getArrowStyle(rect, direction) {
			let style = '';

			if (direction === 'left') {
				style = `top: ${rect.top}px; left: ${rect.left - 40}px;`;
			} else if (direction === 'right') {
				style = `top: ${rect.top}px; left: ${rect.left + rect.width + 10}px;`;
			} else if (direction === 'top') {
				style = `top: ${rect.top - 40}px; left: ${rect.left + rect.width / 2 - 15}px;`;
			} else {
				style = `top: ${rect.top + rect.height + 10}px; left: ${rect.left + rect.width / 2 - 15}px;`;
			}

			return style;
		}

		function getArrowSymbol(direction) {
			switch (direction) {
				case 'left':
					return '→';

				case 'right':
					return '←';

				case 'top':
					return '↓';

				case 'bottom':
					return '↑';
			}

			return '';
		}

		var div = root$b();

		each(div, 21, () => get(rects), index, ($$anchor, rect) => {
			const dir = user_derived(() => getArrowClass(get(rect)));
			var fragment = root_1$a();
			var div_1 = first_child(fragment);
			var div_2 = sibling(div_1, 2);
			var text = child(div_2, true);

			reset(div_2);

			template_effect(
				($0, $1) => {
					set_style(div_1, `top: ${get(rect).top ?? ''}px; left: ${get(rect).left ?? ''}px; width: ${get(rect).width ?? ''}px; height: ${get(rect).height ?? ''}px;`);
					set_class(div_2, 1, `cv-highlight-arrow ${get(dir) ?? ''}`, 'svelte-1fie5i7');
					set_style(div_2, $0);
					set_text(text, $1);
				},
				[
					() => getArrowStyle(get(rect), get(dir)),
					() => getArrowSymbol(get(dir))
				]
			);

			append($$anchor, fragment);
		});

		reset(div);
		append($$anchor, div);
		pop();
	}

	/* highlight-service.svelte.ts generated by Svelte v5.46.1 */

	const HIGHLIGHT_PARAM = 'cv-highlight';
	const BODY_HIGHLIGHT_CLASS = 'cv-highlight-mode';

	const ARROW_OVERLAY_ID = 'cv-highlight-overlay';

	class HighlightState {
		#rects = state(proxy([]));

		get rects() {
			return get(this.#rects);
		}

		set rects(value) {
			set(this.#rects, value, true);
		}
	}

	class HighlightService {
		rootEl;
		overlayApp;
		state = new HighlightState();
		resizeObserver;
		activeTargets = [];
		onWindowResize = () => this.updatePositions();

		constructor(rootEl) {
			this.rootEl = rootEl;

			this.resizeObserver = new ResizeObserver(() => {
				this.updatePositions();
			});
		}

		apply(encodedDescriptors) {
			const descriptors = deserialize(encodedDescriptors);

			if (!descriptors || descriptors.length === 0) return;

			const targets = [];

			descriptors.forEach((desc) => {
				const matchingEls = resolve(this.rootEl, desc);

				if (matchingEls && matchingEls.length > 0) {
					targets.push(...matchingEls);
				}
			});

			if (targets.length === 0) {
				showToast("Some highlighted sections could not be found.");
				this.exit();

				return;
			}

			if (targets.length < descriptors.length) {
				showToast("Some highlighted sections could not be found.");
			}

			// Activate Store
			focusStore.setIsActive(true);

			document.body.classList.add(BODY_HIGHLIGHT_CLASS);

			// Create Overlay across the entire page (App will be mounted into it)
			this.activeTargets = targets;

			// Start observing
			this.activeTargets.forEach((t) => this.resizeObserver.observe(t));

			this.resizeObserver.observe(document.body); // Catch layout shifts
			window.addEventListener('resize', this.onWindowResize);
			this.renderHighlightOverlay();

			// Scroll first target into view with header offset awareness
			const firstTarget = targets[0];

			if (firstTarget) {
				// Use double-RAF to ensure layout stability (e.g. Svelte updates, animations)
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						scrollToElement(firstTarget);
					});
				});
			}
		}

		exit() {
			document.body.classList.remove(BODY_HIGHLIGHT_CLASS);
			this.resizeObserver.disconnect();
			window.removeEventListener('resize', this.onWindowResize);
			this.activeTargets = [];
			this.state.rects = [];

			const overlay = document.getElementById(ARROW_OVERLAY_ID);

			if (this.overlayApp) {
				unmount(this.overlayApp);
				this.overlayApp = undefined;
			}

			if (overlay) overlay.remove();
		}

		renderHighlightOverlay() {
			let overlay = document.getElementById(ARROW_OVERLAY_ID);

			if (!overlay) {
				overlay = document.createElement('div');
				overlay.id = ARROW_OVERLAY_ID;
				document.body.appendChild(overlay);
			}

			overlay.innerHTML = '';

			// Initial calc
			this.updatePositions();

			// 2. Render Overlay Component
			if (this.overlayApp) {
				unmount(this.overlayApp);
			}

			this.overlayApp = mount(HighlightOverlay, { target: overlay, props: { box: this.state } });
		}

		updatePositions() {
			if (this.activeTargets.length === 0) {
				this.state.rects = [];

				return;
			}

			// 1. Group by Parent (Siblings)
			const groups = new Map();

			this.activeTargets.forEach((t) => {
				const parent = t.parentElement || document.body;

				if (!groups.has(parent)) {
					groups.set(parent, []);
				}

				groups.get(parent).push(t);
			});

			// 2. Calculate Union Rect for each group
			const mergedRects = [];

			// Iterate groups to ensure strict adjacency
			for (const [parent, siblingsInGroup] of groups) {
				if (siblingsInGroup.length === 0) continue;

				// Optimization if only 1 child, no need to scan parent
				if (siblingsInGroup.length === 1) {
					this.addMergedRect(mergedRects, siblingsInGroup);

					continue;
				}

				// O(1) lookup
				const siblingsSet = new Set(siblingsInGroup);

				let currentBatch = [];

				// Scan parent children to respect DOM order and interruptions
				// Use parent.children to get Elements only (skip text nodes)
				const children = Array.from(parent.children);

				for (const child of children) {
					if (child instanceof HTMLElement && siblingsSet.has(child)) {
						currentBatch.push(child);
					} else {
						// Break in continuity
						if (currentBatch.length > 0) {
							this.addMergedRect(mergedRects, currentBatch);
							currentBatch = [];
						}
					}
				}

				// Finalize last batch
				if (currentBatch.length > 0) {
					this.addMergedRect(mergedRects, currentBatch);
				}
			}

			this.state.rects = mergedRects;
		}

		addMergedRect(resultList, elements) {
			if (elements.length === 0) return;

			let minTop = Infinity;
			let minLeft = Infinity;
			let maxRight = -Infinity;
			let maxBottom = -Infinity;

			elements.forEach((t) => {
				const r = t.getBoundingClientRect();
				const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
				const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
				const top = r.top + scrollTop;
				const left = r.left + scrollLeft;
				const right = left + r.width;
				const bottom = top + r.height;

				if (top < minTop) minTop = top;
				if (left < minLeft) minLeft = left;
				if (right > maxRight) maxRight = right;
				if (bottom > maxBottom) maxBottom = bottom;
			});

			const PADDING = 10;

			resultList.push({
				top: minTop - PADDING,
				left: minLeft - PADDING,
				width: maxRight - minLeft + PADDING * 2,
				height: maxBottom - minTop + PADDING * 2,
				right: maxRight + PADDING,
				bottom: maxBottom + PADDING,
				element: elements[0]
			});
		}
	}

	const DEFAULT_EXCLUDED_TAGS = ['HEADER', 'NAV', 'FOOTER', 'SCRIPT', 'STYLE'];
	const DEFAULT_EXCLUDED_IDS = ['cv-floating-action-bar', 'cv-hover-helper', 'cv-toast-notification'];

	/* focus-service.svelte.ts generated by Svelte v5.46.1 */

	const FOCUS_PARAM = 'cv-focus';
	const HIDE_PARAM = 'cv-hide';
	const BODY_FOCUS_CLASS = 'cv-focus-mode';
	const HIDDEN_CLASS = 'cv-focus-hidden';
	const FOCUSED_CLASS = 'cv-focused-element';

	class FocusService {
		rootEl;
		hiddenElements = new Set();
		dividers = new Set(); // Store Svelte App instances
		excludedTags;
		excludedIds;

		// Call unsubscribe in destroy to stop svelte effects
		unsubscribe;

		url = new SvelteURL(window.location.href);
		highlightService;

		constructor(rootEl, options) {
			this.rootEl = rootEl;

			const userTags = options.shareExclusions?.tags || [];
			const userIds = options.shareExclusions?.ids || [];

			this.excludedTags = new Set([...DEFAULT_EXCLUDED_TAGS, ...userTags].map((t) => t.toUpperCase()));
			this.excludedIds = new Set([...DEFAULT_EXCLUDED_IDS, ...userIds]);
			this.highlightService = new HighlightService(this.rootEl);

			// Subscribe to store for exit signal
			this.unsubscribe = effect_root(() => {
				// 1. Sync URL changes from SvelteURL back to browser history (UI changes affect URL)
				// This effect handles the "Write" direction: App State -> URL
				user_effect(() => {
					const currentFromBrowser = window.location.href;

					// Cycle prevention: Only push if the SvelteURL has changed/diverged from browser
					if (currentFromBrowser !== this.url.href) {
						window.history.pushState({}, '', this.url.href);
					}
				});

				// 2. React to URL changes (URL changes affect UI)
				// This effect handles the "Read" direction: URL -> App State
				user_effect(() => {
					const focusDescriptors = this.url.searchParams.get(FOCUS_PARAM);
					const hideDescriptors = this.url.searchParams.get(HIDE_PARAM);
					const highlightDescriptors = this.url.searchParams.get(HIGHLIGHT_PARAM);

					untrack(() => {
						if (focusDescriptors) {
							this.applyFocusMode(focusDescriptors);
						} else if (hideDescriptors) {
							this.applyHideMode(hideDescriptors);
						} else if (highlightDescriptors) {
							this.applyHighlightMode(highlightDescriptors);
						} else {
							if (document.body.classList.contains(BODY_FOCUS_CLASS) || document.body.classList.contains(BODY_HIGHLIGHT_CLASS)) {
								this.exitFocusMode();
							}
						}
					});
				});

				// Store safety check (Store changes affect UI)
				user_effect(() => {
					if (!focusStore.isActive && (document.body.classList.contains(BODY_FOCUS_CLASS) || document.body.classList.contains(BODY_HIGHLIGHT_CLASS))) {
						this.exitFocusMode();
					}
				});
			});

			// Listen for popstate to sync back to SvelteURL
			window.addEventListener('popstate', this.handlePopState);
		}

		/**
		 * Sync native browser navigation with SvelteURL
		 */
		handlePopState = () => {
			this.url.href = window.location.href;
		};

		/**
		 * Applies focus mode to the specified descriptors.
		 * @param encodedDescriptors - The encoded descriptors to apply.
		 */
		applyFocusMode(encodedDescriptors) {
			// Check if we are already in the right state to avoid re-rendering loops if feasible
			if (document.body.classList.contains(BODY_FOCUS_CLASS) || document.body.classList.contains(BODY_HIGHLIGHT_CLASS)) {
				// If we are already active, we might want to check if descriptors changed?
				// For now, simple clear and re-apply.
				this.exitFocusMode(false); // don't clear URL here
			}

			const descriptors = deserialize(encodedDescriptors);

			if (!descriptors || descriptors.length === 0) return;

			// Resolve anchors to DOM elements
			const targets = [];

			descriptors.forEach((desc) => {
				const matchingEls = resolve(this.rootEl, desc);

				if (matchingEls && matchingEls.length > 0) {
					targets.push(...matchingEls);
				}
			});

			if (targets.length === 0) {
				showToast("Some shared sections could not be found.");
				this.exitFocusMode(); // Clears URL and resets state, preventing effect loop

				return;
			}

			if (targets.length < descriptors.length) {
				showToast("Some shared sections could not be found.");
			}

			// Activate Store
			focusStore.setIsActive(true);

			document.body.classList.add(BODY_FOCUS_CLASS);
			this.renderFocusedView(targets);
		}

		applyHideMode(encodedDescriptors) {
			if (document.body.classList.contains(BODY_FOCUS_CLASS) || document.body.classList.contains(BODY_HIGHLIGHT_CLASS)) {
				this.exitFocusMode(false);
			}

			const descriptors = deserialize(encodedDescriptors);

			if (!descriptors || descriptors.length === 0) return;

			const targets = [];

			descriptors.forEach((desc) => {
				const matchingEls = resolve(this.rootEl, desc);

				if (matchingEls && matchingEls.length > 0) {
					targets.push(...matchingEls);
				}
			});

			if (targets.length === 0) {
				showToast("Some shared sections could not be found.");
				this.exitFocusMode(); // Clears URL and resets state

				return;
			}

			if (targets.length < descriptors.length) {
				showToast("Some shared sections could not be found.");
			}

			// Activate Store
			focusStore.setIsActive(true);

			document.body.classList.add(BODY_FOCUS_CLASS);
			this.renderHiddenView(targets);
		}

		applyHighlightMode(encodedDescriptors) {
			if (document.body.classList.contains(BODY_FOCUS_CLASS) || document.body.classList.contains(BODY_HIGHLIGHT_CLASS)) {
				this.exitFocusMode(false);
			}

			this.highlightService.apply(encodedDescriptors);
		}

		renderHiddenView(targets) {
			// 1. Mark targets as hidden
			targets.forEach((t) => {
				t.classList.add(HIDDEN_CLASS);
				this.hiddenElements.add(t);
			});

			// 2. Insert Dividers
			const processedContainers = new Set();

			targets.forEach((el) => {
				const parent = el.parentElement;

				if (parent && !processedContainers.has(parent)) {
					this.insertDividersForContainer(parent);
					processedContainers.add(parent);
				}
			});
		}

		renderFocusedView(targets) {
			// 1. Mark targets
			targets.forEach((t) => t.classList.add(FOCUSED_CLASS));

			// 2. Identify Elements to Keep Visible (Targets + Ancestors)
			const keepVisible = new Set();

			targets.forEach((t) => {
				let curr = t;

				while (curr && curr !== document.body && curr !== document.documentElement) {
					keepVisible.add(curr);
					curr = curr.parentElement;
				}
			});

			// 3. Hide Siblings
			keepVisible.forEach((el) => {
				if (el === document.body) return;

				const parent = el.parentElement;

				if (!parent) return;

				// Parent Dominance: If parent is focused, don't hide its children
				if (parent.classList.contains(FOCUSED_CLASS)) {
					return;
				}

				Array.from(parent.children).forEach((child) => {
					if (child instanceof HTMLElement && !keepVisible.has(child)) {
						this.hideElement(child);
					}
				});
			});

			// 4. Insert Dividers
			const processedContainers = new Set();

			keepVisible.forEach((el) => {
				const parent = el.parentElement;

				if (parent && !processedContainers.has(parent)) {
					this.insertDividersForContainer(parent);
					processedContainers.add(parent);
				}
			});
		}

		hideElement(el) {
			if (this.hiddenElements.has(el)) return;
			if (this.excludedTags.has(el.tagName.toUpperCase())) return;
			if (el.id && this.excludedIds.has(el.id)) return;
			if (el.getAttribute('aria-hidden') === 'true') return;

			// Exclude Toast/Banner/Overlay/SettingsIcon/WidgetRoot
			if (el.closest('.toast-container') || el.id === 'cv-exit-focus-banner' || el.classList.contains('cv-settings-icon') || el.classList.contains('cv-widget-root')) return;

			if (el.querySelector('header, footer, nav') !== null) return;

			el.classList.add(HIDDEN_CLASS);
			this.hiddenElements.add(el);
		}

		insertDividersForContainer(container) {
			const children = Array.from(container.children);
			let hiddenCount = 0;
			let hiddenGroupStart = null;

			children.forEach((child) => {
				if (child.classList.contains(HIDDEN_CLASS)) {
					if (hiddenCount === 0) hiddenGroupStart = child;

					hiddenCount++;
				} else {
					if (hiddenCount > 0 && hiddenGroupStart) {
						this.createDivider(container, hiddenGroupStart, hiddenCount);
						hiddenCount = 0;
						hiddenGroupStart = null;
					}
				}
			});

			if (hiddenCount > 0 && hiddenGroupStart) {
				this.createDivider(container, hiddenGroupStart, hiddenCount);
			}
		}

		createDivider(container, insertBeforeEl, count) {
			const wrapper = document.createElement('div');

			wrapper.className = 'cv-divider-wrapper';
			container.insertBefore(wrapper, insertBeforeEl);

			const app = mount(FocusDivider, {
				target: wrapper,

				props: {
					hiddenCount: count,

					onExpand: () => {
						this.expandContext(insertBeforeEl, count, app, wrapper);
					}
				}
			});

			this.dividers.add(app);
		}

		expandContext(firstHidden, count, app, wrapper) {
			let curr = firstHidden;
			let expanded = 0;

			while (curr && expanded < count) {
				if (curr instanceof HTMLElement && curr.classList.contains(HIDDEN_CLASS)) {
					curr.classList.remove(HIDDEN_CLASS);
					this.hiddenElements.delete(curr);
				}

				curr = curr.nextElementSibling;
				expanded++;
			}

			// Cleanup
			unmount(app);

			this.dividers.delete(app);
			wrapper.remove();

			// If no more hidden elements, exit completely
			if (this.hiddenElements.size === 0) {
				focusStore.exit();
			}
		}

		exitFocusMode(updateUrl = true) {
			document.body.classList.remove(BODY_FOCUS_CLASS, BODY_HIGHLIGHT_CLASS);
			this.hiddenElements.forEach((el) => el.classList.remove(HIDDEN_CLASS));
			this.hiddenElements.clear();

			// Remove dividers
			this.dividers.forEach((app) => unmount(app));

			this.dividers.clear();

			// Remove wrappers? 
			document.querySelectorAll('.cv-divider-wrapper').forEach((el) => el.remove());

			// Remove styling from targets
			const targets = document.querySelectorAll(`.${FOCUSED_CLASS}`);

			targets.forEach((t) => t.classList.remove(FOCUSED_CLASS));
			this.highlightService.exit();

			if (focusStore.isActive) {
				focusStore.setIsActive(false);
			}

			if (updateUrl) {
				if (this.url.searchParams.has(FOCUS_PARAM)) {
					this.url.searchParams.delete(FOCUS_PARAM);
				}

				if (this.url.searchParams.has(HIDE_PARAM)) {
					this.url.searchParams.delete(HIDE_PARAM);
				}

				if (this.url.searchParams.has(HIGHLIGHT_PARAM)) {
					this.url.searchParams.delete(HIGHLIGHT_PARAM);
				}
			}
		}

		destroy() {
			this.exitFocusMode();
			this.unsubscribe();
			window.removeEventListener('popstate', this.handlePopState);
		}
	}

	/* placeholder-value-store.svelte.ts generated by Svelte v5.46.1 */

	const STORAGE_KEY = 'cv-user-variables';

	class PlaceholderValueStore {
		#values = state(proxy({}));

		get values() {
			return get(this.#values);
		}

		set values(value) {
			set(this.#values, value, true);
		}

		constructor() {
			this.load();
		}

		load() {
			try {
				const stored = localStorage.getItem(STORAGE_KEY);

				if (stored) {
					this.values = JSON.parse(stored);
				}
			} catch(e) {
				console.warn('[CustomViews] Failed to load user variables:', e);
			}
		}

		persist() {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(this.values));
			} catch(e) {
				console.warn('[CustomViews] Failed to save user variables:', e);
			}
		}

		getValue(name) {
			return this.values[name];
		}

		set(name, value) {
			this.values[name] = value;
		}
	}

	const placeholderValueStore = new PlaceholderValueStore();

	/* placeholder-registry-store.svelte.ts generated by Svelte v5.46.1 */

	class PlaceholderRegistryStore {
		#definitions = state(proxy([]));

		get definitions() {
			return get(this.#definitions);
		}

		set definitions(value) {
			set(this.#definitions, value, true);
		}

		register(def) {
			const existingIndex = this.definitions.findIndex((d) => d.name === def.name);

			if (existingIndex !== -1) {
				// Access proxy value to compare
				const existing = this.definitions[existingIndex];

				if (existing && (existing.settingsLabel !== def.settingsLabel || existing.settingsHint !== def.settingsHint || existing.defaultValue !== def.defaultValue)) {
					this.definitions[existingIndex] = def;
				}
			} else {
				this.definitions.push(def);
			}
		}
	}

	const placeholderRegistryStore = new PlaceholderRegistryStore();

	/* main-store.svelte.ts generated by Svelte v5.46.1 */

	class DataStore {
		#config = /**
		     * Static configuration loaded at startup.
		     * Contains definitions for toggles, tab groups, and defaults.
		     */
		state(proxy({}));

		get config() {
			return get(this.#config);
		}

		set config(value) {
			set(this.#config, value, true);
		}

		#state = state(proxy({ shownToggles: [], peekToggles: [], tabs: {} }));

		get state() {
			return get(this.#state);
		}

		set state(value) {
			set(this.#state, value, true);
		}

		#detectedToggles = state(proxy(new SvelteSet()));

		get detectedToggles() {
			return get(this.#detectedToggles);
		}

		set detectedToggles(value) {
			set(this.#detectedToggles, value, true);
		}

		#detectedTabGroups = state(proxy(new SvelteSet()));

		get detectedTabGroups() {
			return get(this.#detectedTabGroups);
		}

		set detectedTabGroups(value) {
			set(this.#detectedTabGroups, value, true);
		}

		#isTabGroupNavHeadingVisible = state(true);

		get isTabGroupNavHeadingVisible() {
			return get(this.#isTabGroupNavHeadingVisible);
		}

		set isTabGroupNavHeadingVisible(value) {
			set(this.#isTabGroupNavHeadingVisible, value, true);
		}

		#assetsManager = state(undefined);

		get assetsManager() {
			return get(this.#assetsManager);
		}

		set assetsManager(value) {
			set(this.#assetsManager, value, true);
		}

		#menuToggles = user_derived(() => {
			if (!this.config.toggles) return [];

			return this.config.toggles.filter((t) => !t.isLocal || this.detectedToggles.has(t.toggleId));
		});

		get menuToggles() {
			return get(this.#menuToggles);
		}

		set menuToggles(value) {
			set(this.#menuToggles, value);
		}

		#menuTabGroups = user_derived(() => {
			if (!this.config.tabGroups) return [];

			return this.config.tabGroups.filter((g) => !g.isLocal || this.detectedTabGroups.has(g.groupId));
		});

		get menuTabGroups() {
			return get(this.#menuTabGroups);
		}

		set menuTabGroups(value) {
			set(this.#menuTabGroups, value);
		}

		#hasMenuOptions = user_derived(() => this.menuToggles.length > 0 || this.menuTabGroups.length > 0);

		get hasMenuOptions() {
			return get(this.#hasMenuOptions);
		}

		set hasMenuOptions(value) {
			set(this.#hasMenuOptions, value);
		}

		#hasPageElements = user_derived(() => this.detectedToggles.size > 0 || this.detectedTabGroups.size > 0);

		get hasPageElements() {
			return get(this.#hasPageElements);
		}

		set hasPageElements(value) {
			set(this.#hasPageElements, value);
		}

		constructor(initialConfig = {}) {
			this.config = initialConfig;
			this.state = this.computeDefaultState();
		}

		// --- Actions ---
		/**
		 * Set the pinned tab for a specific tab group.
		 * This syncs across all tab groups with the same ID.
		 * @param groupId The ID of the tab group.
		 * @param tabId The ID of the tab to pin.
		 */
		setPinnedTab(groupId, tabId) {
			if (!this.state.tabs) this.state.tabs = {};

			this.state.tabs[groupId] = tabId;

			// Sync to placeholder if configured
			const groupConfig = this.config.tabGroups?.find((g) => g.groupId === groupId);

			if (groupConfig?.placeholderId) {
				const tabConfig = groupConfig.tabs.find((t) => t.tabId === tabId);

				if (tabConfig?.placeholderValue) {
					placeholderValueStore.set(groupConfig.placeholderId, tabConfig.placeholderValue);
				}
			}
		}

		/**
		 * Update the visibility of toggles.
		 * @param shown List of IDs for toggles in "Show" state.
		 * @param peek List of IDs for toggles in "Peek" state.
		 */
		setToggles(shown, peek) {
			this.state.shownToggles = shown;
			this.state.peekToggles = peek;
		}

		/**
		 * Updates the full state (e.g. from URL or Persistence).
		 * Merges the new state with computed defaults to ensure completeness.
		 * @param newState Partial state object to apply.
		 */
		applyState(newState) {
			// Merge with defaults to prevent partial states from breaking things
			const defaults = this.computeDefaultState();

			this.state = {
				shownToggles: newState.shownToggles ?? defaults.shownToggles ?? [],
				peekToggles: newState.peekToggles ?? defaults.peekToggles ?? [],
				tabs: { ...defaults.tabs, ...newState.tabs }
			};
		}

		/**
		 * Resets the application state to the computed defaults (defined in config).
		 */
		reset() {
			this.state = this.computeDefaultState();
		}

		// --- Registry Actions ---
		/**
		 * Registers a toggle as active on the current page.
		 * @param id The ID of the toggle found in the DOM.
		 */
		registerToggle(id) {
			this.detectedToggles.add(id);
		}

		/**
		 * Registers a tab group as active on the current page.
		 * @param id The ID of the tab group found in the DOM.
		 */
		registerTabGroup(id) {
			this.detectedTabGroups.add(id);

			// Register corresponding placeholder if defined
			const groupConfig = this.config.tabGroups?.find((g) => g.groupId === id);

			if (groupConfig?.placeholderId) {
				placeholderRegistryStore.register({
					name: groupConfig.placeholderId,
					settingsLabel: groupConfig.label ?? id
				});

				// Initial Sync: If we have an active tab for this group, sync its value immediately
				const activeTabId = this.state.tabs?.[id];

				if (activeTabId) {
					const tabConfig = groupConfig.tabs.find((t) => t.tabId === activeTabId);

					// Only set if we have a value and the placeholder store doesn't (to respect user overrides if any, though store.set overwrites anyway)
					// Actually, tab selection should be authoritative for binding.
					if (tabConfig?.placeholderValue) {
						placeholderValueStore.set(groupConfig.placeholderId, tabConfig.placeholderValue);
					}
				}
			}
		}

		/**
		 * Clears the component registry.
		 * Should be called when scanning a fresh part of the DOM or resetting.
		 */
		clearRegistry() {
			this.detectedToggles.clear();
			this.detectedTabGroups.clear();
		}

		/**
		 * Sets the assets manager for dynamic content rendering.
		 */
		setAssetsManager(manager) {
			this.assetsManager = manager;
		}

		// --- Helpers ---
		computeDefaultState() {
			const shownToggles = [];
			const peekToggles = [];
			const tabs = {};

			// 1. Process Toggles
			if (this.config.toggles) {
				this.config.toggles.forEach((toggle) => {
					if (toggle.default === 'peek') {
						peekToggles.push(toggle.toggleId);
					} else if (toggle.default === 'hide') ; else {
						// 'show' is the implicit default (or if explicitly set to 'show')
						shownToggles.push(toggle.toggleId);
					}
				});
			}

			// 2. Process Tab Groups
			if (this.config.tabGroups) {
				this.config.tabGroups.forEach((group) => {
					// If a specific default tab is configured, use it
					if (group.default) {
						tabs[group.groupId] = group.default;
					} else // Fallback: Use the first tab if no specific default is set
					if (group.tabs && group.tabs.length > 0) {
						const firstTab = group.tabs[0];

						if (firstTab?.tabId) {
							tabs[group.groupId] = firstTab.tabId;
						}
					}
				});
			}

			return { shownToggles, peekToggles, tabs };
		}
	}

	// Hollow Singleton - created immediately with empty state
	// Runs once once, cached and returns same store instance.
	const store = new DataStore({});

	/**
	 * Initialize the store with actual configuration.
	 * This populates the hollow singleton with real data.
	 */
	function initStore(config) {
		// Mutate config in place to preserve reactivity
		Object.assign(store.config, config);

		// Compute new state
		const newState = store.computeDefaultState();

		// Mutate state properties in place to preserve reactivity
		store.state.shownToggles = newState.shownToggles ?? [];

		store.state.peekToggles = newState.peekToggles ?? [];
		store.state.tabs = newState.tabs ?? {};

		return store;
	}

	/**
	 * DOM Scanner for Variable Interpolation
	 *
	 * Scans the DOM for [[ variable_name ]] patterns and replaces them with
	 * reactive spans that update when the variable store changes.
	 */
	// Regex to find [[ variable : fallback ]]
	// Group 1: escape character (backslashes)
	// Group 2: variable name
	// Group 3 (optional): fallback value
	const VAR_REGEX = /(\\)?\[\[\s*([a-zA-Z0-9_]+)(?:\s*:\s*(.*?))?\s*\]\]/g;
	// Non-global version for stateless testing
	const VAR_TESTER = /(\\)?\[\[\s*([a-zA-Z0-9_]+)(?:\s*:\s*(.*?))?\s*\]\]/;
	class PlaceholderBinder {
	    /**
	     * Scans the root element for text nodes containing variable placeholders.
	     * Replaces them with <span class="cv-var" data-name="...">...</span>.
	     *
	     * Also scans for elements with .cv-bind or [data-cv-bind] to setup attribute bindings.
	     */
	    static scanAndHydrate(root) {
	        this.scanTextNodes(root);
	        this.scanAttributeBindings(root);
	    }
	    /**
	     * Updates all <span class="cv-var"> elements with new values.
	     * Also updates attributes on elements with [data-cv-attr-templates].
	     */
	    static updateAll(values) {
	        this.updateTextNodes(values);
	        this.updateAttributeBindings(values);
	    }
	    // =========================================================================
	    // Scanning Logic
	    // =========================================================================
	    static scanTextNodes(root) {
	        const textNodes = [];
	        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
	            acceptNode: (node) => {
	                // Skip script/style tags
	                if (node.parentElement && ['SCRIPT', 'STYLE'].includes(node.parentElement.tagName)) {
	                    return NodeFilter.FILTER_REJECT;
	                }
	                // Skip existing variables to prevent observer loops
	                if (node.parentElement && node.parentElement.classList.contains('cv-var')) {
	                    return NodeFilter.FILTER_REJECT;
	                }
	                return VAR_TESTER.test(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	            }
	        });
	        while (walker.nextNode()) {
	            textNodes.push(walker.currentNode);
	        }
	        // Process nodes
	        textNodes.forEach(node => {
	            PlaceholderBinder.processTextNode(node);
	        });
	    }
	    static scanAttributeBindings(root) {
	        // Attribute Scanning (Opt-in)
	        const candidates = root.querySelectorAll('.cv-bind, [data-cv-bind]');
	        candidates.forEach(el => {
	            if (el instanceof HTMLElement) {
	                PlaceholderBinder.processElementAttributes(el);
	            }
	        });
	    }
	    static processTextNode(textNode) {
	        const text = textNode.nodeValue || '';
	        let match;
	        let lastIndex = 0;
	        const fragment = document.createDocumentFragment();
	        let hasMatch = false;
	        // Reset regex state
	        VAR_REGEX.lastIndex = 0;
	        while ((match = VAR_REGEX.exec(text)) !== null) {
	            hasMatch = true;
	            const [fullMatch, escape, name, fallback] = match;
	            const index = match.index;
	            // Append text before match
	            if (index > lastIndex) {
	                fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
	            }
	            if (escape) {
	                // If escaped, append the text without the backslash
	                // fullMatch matches '\[[...]]', slice(1) gives '[[...]]'
	                fragment.appendChild(document.createTextNode(fullMatch.slice(1)));
	            }
	            else {
	                // Create Span
	                const span = document.createElement('span');
	                span.className = 'cv-var';
	                span.dataset.name = name;
	                if (fallback)
	                    span.dataset.fallback = fallback;
	                span.textContent = fullMatch; // Will be hydrated later
	                fragment.appendChild(span);
	            }
	            lastIndex = VAR_REGEX.lastIndex;
	        }
	        if (hasMatch) {
	            // Append remaining text
	            if (lastIndex < text.length) {
	                fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
	            }
	            textNode.replaceWith(fragment);
	        }
	    }
	    static processElementAttributes(el) {
	        if (el.dataset.cvAttrTemplates)
	            return; // Already processed
	        const templates = {};
	        let hasBindings = false;
	        // Iterate all attributes
	        for (const attr of Array.from(el.attributes)) {
	            if (attr.name.startsWith('data-cv'))
	                continue; // Skip own attributes
	            if (VAR_TESTER.test(attr.value)) {
	                templates[attr.name] = attr.value;
	                hasBindings = true;
	            }
	        }
	        if (hasBindings) {
	            el.dataset.cvAttrTemplates = JSON.stringify(templates);
	        }
	    }
	    // =========================================================================
	    // Update Logic
	    // =========================================================================
	    static updateTextNodes(values) {
	        const spans = document.querySelectorAll('.cv-var');
	        spans.forEach(span => {
	            if (span instanceof HTMLElement) {
	                const name = span.dataset.name;
	                const fallback = span.dataset.fallback || '';
	                if (name) {
	                    const finalValue = PlaceholderBinder.resolveValue(name, fallback, values);
	                    span.textContent = finalValue ?? `[[${name}]]`;
	                }
	            }
	        });
	    }
	    static updateAttributeBindings(values) {
	        const attrElements = document.querySelectorAll('[data-cv-attr-templates]');
	        attrElements.forEach(el => {
	            if (el instanceof HTMLElement) {
	                try {
	                    const templates = JSON.parse(el.dataset.cvAttrTemplates || '{}');
	                    Object.entries(templates).forEach(([attrName, template]) => {
	                        const newValue = PlaceholderBinder.interpolateString(template, values, attrName);
	                        el.setAttribute(attrName, newValue);
	                    });
	                }
	                catch (e) {
	                    console.warn('Failed to parse cv-attr-templates', e);
	                }
	            }
	        });
	    }
	    // =========================================================================
	    // Resolution Helpers
	    // =========================================================================
	    static resolveValue(name, fallback, values) {
	        const userVal = values[name];
	        // Look up registry definition
	        const def = placeholderRegistryStore.definitions.find(d => d.name === name);
	        const registryDefault = def?.defaultValue;
	        if (userVal !== undefined && userVal !== '') {
	            return userVal;
	        }
	        else if (registryDefault !== undefined && registryDefault !== '') {
	            return registryDefault;
	        }
	        else if (fallback) {
	            return fallback;
	        }
	        return undefined;
	    }
	    static interpolateString(template, values, attrName) {
	        return template.replace(VAR_REGEX, (_full, escape, name, fallback) => {
	            if (escape)
	                return `[[${name}]]`;
	            let val = PlaceholderBinder.resolveValue(name, fallback, values);
	            if (val === undefined)
	                return `[[${name}]]`;
	            // Auto-encode for URL attributes
	            if (attrName && (attrName === 'href' || attrName === 'src')) {
	                val = encodeURIComponent(val);
	            }
	            return val;
	        });
	    }
	}

	/* core.svelte.ts generated by Svelte v5.46.1 */

	class CustomViewsCore {
		/**
		 * The single source of truth for application state.
		 */
		store;

		rootEl;
		persistenceManager;
		focusService;
		showUrlEnabled;
		destroyEffectRoot;

		constructor(opt) {
			this.rootEl = opt.rootEl || document.body;
			this.persistenceManager = new PersistenceManager();
			this.showUrlEnabled = opt.showUrl ?? false;

			// Initialize Reactive Store Singleton
			this.store = initStore(opt.config);

			// Store assetsManager in global store for component access
			this.store.setAssetsManager(opt.assetsManager);

			// Initial State Resolution: URL > Persistence > Default
			this.resolveInitialState();

			// Resolve Exclusions
			this.focusService = new FocusService(this.rootEl, { shareExclusions: opt.config.shareExclusions || {} });
		}

		resolveInitialState() {
			// 1. URL State
			const urlState = URLStateManager.parseURL();

			if (urlState) {
				this.store.applyState(urlState);

				return;
			}

			// 2. Persisted State
			const persistedState = this.persistenceManager.getPersistedState();

			if (persistedState) {
				this.store.applyState(persistedState);

				return;
			}
		}

		/**
		 * Initializes the CustomViews core.
		 *
		 * Components (Toggle, TabGroup) self-register during their mount lifecycle.
		 * Core only manages global reactivity for URL state and persistence.
		 */
		async init() {
			// Restore tab nav visibility preference
			const navPref = this.persistenceManager.getPersistedTabNavVisibility();

			if (navPref !== null) {
				this.store.isTabGroupNavHeadingVisible = navPref;
			}

			// Run initial scan (non-reactive)
			PlaceholderBinder.scanAndHydrate(this.rootEl);

			// Setup Global Reactivity using $effect.root
			this.destroyEffectRoot = effect_root(() => {
				// Effect 1: Update URL
				user_effect(() => {
					if (this.showUrlEnabled) {
						URLStateManager.updateURL(this.store.state);
					} else {
						URLStateManager.clearURL();
					}
				});

				// Effect 2: Persistence
				user_effect(() => {
					this.persistenceManager.persistState(this.store.state);
					this.persistenceManager.persistTabNavVisibility(this.store.isTabGroupNavHeadingVisible);
				});

				// Effect 3: React to Variable Changes
				user_effect(() => {
					PlaceholderBinder.updateAll(placeholderValueStore.values);
					placeholderValueStore.persist();
				});
			});

			// Handle History Popstate
			window.addEventListener("popstate", () => {
				const urlState = URLStateManager.parseURL();

				if (urlState) {
					this.store.applyState(urlState);
				}
			});
		}

		// --- Public APIs for Widget/Other ---
		resetToDefault() {
			this.persistenceManager.clearAll();
			this.store.reset();
			this.store.isTabGroupNavHeadingVisible = true;
			URLStateManager.clearURL();
		}

		destroy() {
			this.destroyEffectRoot?.();
			this.focusService.destroy();
		}
	}

	class AssetsManager {
	    assets;
	    baseURL;
	    constructor(assets, baseURL = '') {
	        this.assets = assets;
	        this.baseURL = baseURL;
	        if (!this.validate()) {
	            console.warn('Invalid assets:', this.assets);
	        }
	    }
	    // Check each asset has content or src
	    validate() {
	        return Object.values(this.assets).every(a => a.src || a.content);
	    }
	    get(assetId) {
	        const asset = this.assets[assetId];
	        if (!asset)
	            return undefined;
	        // If there's a baseURL and the asset has a src property, prepend the baseURL
	        if (this.baseURL && asset.src) {
	            // Create a shallow copy to avoid mutating the original asset
	            return {
	                ...asset,
	                src: this.prependBaseURL(asset.src)
	            };
	        }
	        return asset;
	    }
	    prependBaseURL(path) {
	        // Don't prepend if the path is already absolute (starts with http:// or https://)
	        if (path.startsWith('http://') || path.startsWith('https://')) {
	            return path;
	        }
	        // Ensure baseURL doesn't end with / and path starts with /
	        const cleanBaseURL = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
	        const cleanPath = path.startsWith('/') ? path : '/' + path;
	        return cleanBaseURL + cleanPath;
	    }
	    loadFromJSON(json) {
	        this.assets = json;
	    }
	    loadAdditionalAssets(additionalAssets) {
	        this.assets = { ...this.assets, ...additionalAssets };
	    }
	}

	/**
	 * Helper function to prepend baseUrl to a path
	 * @param path The path to prepend the baseUrl to
	 * @param baseUrl The base URL to prepend
	 * @returns The full URL with baseUrl prepended if applicable
	 */
	function prependBaseUrl(path, baseUrl) {
	    if (!baseUrl)
	        return path;
	    // Don't prepend if the path is already absolute (starts with http:// or https://)
	    if (path.startsWith('http://') || path.startsWith('https://')) {
	        return path;
	    }
	    // Ensure baseUrl doesn't end with / and path starts with /
	    const cleanbaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
	    const cleanPath = path.startsWith('/') ? path : '/' + path;
	    return cleanbaseUrl + cleanPath;
	}

	/**
	 * Icon utilities for CustomViews settings
	 * Centralized SVG icons for better maintainability and reusability
	 */
	/**
	 * Settings gear icon for modal header
	 */
	function getGearIcon() {
	    return `<svg class="cv-modal-icon-svg" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M12 8.00002C9.79085 8.00002 7.99999 9.79088 7.99999 12C7.99999 14.2092 9.79085 16 12 16C14.2091 16 16 14.2092 16 12C16 9.79088 14.2091 8.00002 12 8.00002ZM9.99999 12C9.99999 10.8955 10.8954 10 12 10C13.1046 10 14 10.8955 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 9.99999 13.1046 9.99999 12Z" fill="#0F1729"/>
  <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M10.7673 1.01709C10.9925 0.999829 11.2454 0.99993 11.4516 1.00001L12.5484 1.00001C12.7546 0.99993 13.0075 0.999829 13.2327 1.01709C13.4989 1.03749 13.8678 1.08936 14.2634 1.26937C14.7635 1.49689 15.1915 1.85736 15.5007 2.31147C15.7454 2.67075 15.8592 3.0255 15.9246 3.2843C15.9799 3.50334 16.0228 3.75249 16.0577 3.9557L16.1993 4.77635L16.2021 4.77788C16.2369 4.79712 16.2715 4.81659 16.306 4.8363L16.3086 4.83774L17.2455 4.49865C17.4356 4.42978 17.6693 4.34509 17.8835 4.28543C18.1371 4.2148 18.4954 4.13889 18.9216 4.17026C19.4614 4.20998 19.9803 4.39497 20.4235 4.70563C20.7734 4.95095 21.0029 5.23636 21.1546 5.4515C21.2829 5.63326 21.4103 5.84671 21.514 6.02029L22.0158 6.86003C22.1256 7.04345 22.2594 7.26713 22.3627 7.47527C22.4843 7.7203 22.6328 8.07474 22.6777 8.52067C22.7341 9.08222 22.6311 9.64831 22.3803 10.1539C22.1811 10.5554 21.9171 10.8347 21.7169 11.0212C21.5469 11.1795 21.3428 11.3417 21.1755 11.4746L20.5 12L21.1755 12.5254C21.3428 12.6584 21.5469 12.8205 21.7169 12.9789C21.9171 13.1653 22.1811 13.4446 22.3802 13.8461C22.631 14.3517 22.7341 14.9178 22.6776 15.4794C22.6328 15.9253 22.4842 16.2797 22.3626 16.5248C22.2593 16.7329 22.1255 16.9566 22.0158 17.14L21.5138 17.9799C21.4102 18.1535 21.2828 18.3668 21.1546 18.5485C21.0028 18.7637 20.7734 19.0491 20.4234 19.2944C19.9803 19.6051 19.4613 19.7901 18.9216 19.8298C18.4954 19.8612 18.1371 19.7852 17.8835 19.7146C17.6692 19.6549 17.4355 19.5703 17.2454 19.5014L16.3085 19.1623L16.306 19.1638C16.2715 19.1835 16.2369 19.2029 16.2021 19.2222L16.1993 19.2237L16.0577 20.0443C16.0228 20.2475 15.9799 20.4967 15.9246 20.7157C15.8592 20.9745 15.7454 21.3293 15.5007 21.6886C15.1915 22.1427 14.7635 22.5032 14.2634 22.7307C13.8678 22.9107 13.4989 22.9626 13.2327 22.983C13.0074 23.0002 12.7546 23.0001 12.5484 23H11.4516C11.2454 23.0001 10.9925 23.0002 10.7673 22.983C10.5011 22.9626 10.1322 22.9107 9.73655 22.7307C9.23648 22.5032 8.80849 22.1427 8.49926 21.6886C8.25461 21.3293 8.14077 20.9745 8.07542 20.7157C8.02011 20.4967 7.97723 20.2475 7.94225 20.0443L7.80068 19.2237L7.79791 19.2222C7.7631 19.2029 7.72845 19.1835 7.69396 19.1637L7.69142 19.1623L6.75458 19.5014C6.5645 19.5702 6.33078 19.6549 6.11651 19.7146C5.86288 19.7852 5.50463 19.8611 5.07841 19.8298C4.53866 19.7901 4.01971 19.6051 3.57654 19.2944C3.2266 19.0491 2.99714 18.7637 2.84539 18.5485C2.71718 18.3668 2.58974 18.1534 2.4861 17.9798L1.98418 17.14C1.87447 16.9566 1.74067 16.7329 1.63737 16.5248C1.51575 16.2797 1.36719 15.9253 1.32235 15.4794C1.26588 14.9178 1.36897 14.3517 1.61976 13.8461C1.81892 13.4446 2.08289 13.1653 2.28308 12.9789C2.45312 12.8205 2.65717 12.6584 2.82449 12.5254L3.47844 12.0054V11.9947L2.82445 11.4746C2.65712 11.3417 2.45308 11.1795 2.28304 11.0212C2.08285 10.8347 1.81888 10.5554 1.61972 10.1539C1.36893 9.64832 1.26584 9.08224 1.3223 8.52069C1.36714 8.07476 1.51571 7.72032 1.63732 7.47528C1.74062 7.26715 1.87443 7.04347 1.98414 6.86005L2.48605 6.02026C2.58969 5.84669 2.71714 5.63326 2.84534 5.45151C2.9971 5.23637 3.22655 4.95096 3.5765 4.70565C4.01966 4.39498 4.53862 4.20999 5.07837 4.17027C5.50458 4.1389 5.86284 4.21481 6.11646 4.28544C6.33072 4.34511 6.56444 4.4298 6.75451 4.49867L7.69141 4.83775L7.69394 4.8363C7.72844 4.8166 7.7631 4.79712 7.79791 4.77788L7.80068 4.77635L7.94225 3.95571C7.97723 3.7525 8.02011 3.50334 8.07542 3.2843C8.14077 3.0255 8.25461 2.67075 8.49926 2.31147C8.80849 1.85736 9.23648 1.49689 9.73655 1.26937C10.1322 1.08936 10.5011 1.03749 10.7673 1.01709ZM14.0938 4.3363C14.011 3.85634 13.9696 3.61637 13.8476 3.43717C13.7445 3.2858 13.6019 3.16564 13.4352 3.0898C13.2378 3.00002 12.9943 3.00002 12.5073 3.00002H11.4927C11.0057 3.00002 10.7621 3.00002 10.5648 3.0898C10.3981 3.16564 10.2555 3.2858 10.1524 3.43717C10.0304 3.61637 9.98895 3.85634 9.90615 4.3363L9.75012 5.24064C9.69445 5.56333 9.66662 5.72467 9.60765 5.84869C9.54975 5.97047 9.50241 6.03703 9.40636 6.13166C9.30853 6.22804 9.12753 6.3281 8.76554 6.52822C8.73884 6.54298 8.71227 6.55791 8.68582 6.57302C8.33956 6.77078 8.16643 6.86966 8.03785 6.90314C7.91158 6.93602 7.83293 6.94279 7.70289 6.93196C7.57049 6.92094 7.42216 6.86726 7.12551 6.7599L6.11194 6.39308C5.66271 6.2305 5.43809 6.14921 5.22515 6.16488C5.04524 6.17811 4.87225 6.23978 4.72453 6.34333C4.5497 6.46589 4.42715 6.67094 4.18206 7.08103L3.72269 7.84965C3.46394 8.2826 3.33456 8.49907 3.31227 8.72078C3.29345 8.90796 3.32781 9.09665 3.41141 9.26519C3.51042 9.4648 3.7078 9.62177 4.10256 9.9357L4.82745 10.5122C5.07927 10.7124 5.20518 10.8126 5.28411 10.9199C5.36944 11.036 5.40583 11.1114 5.44354 11.2504C5.47844 11.379 5.47844 11.586 5.47844 12C5.47844 12.414 5.47844 12.621 5.44354 12.7497C5.40582 12.8887 5.36944 12.9641 5.28413 13.0801C5.20518 13.1875 5.07927 13.2876 4.82743 13.4879L4.10261 14.0643C3.70785 14.3783 3.51047 14.5352 3.41145 14.7349C3.32785 14.9034 3.29349 15.0921 3.31231 15.2793C3.33461 15.501 3.46398 15.7174 3.72273 16.1504L4.1821 16.919C4.4272 17.3291 4.54974 17.5342 4.72457 17.6567C4.8723 17.7603 5.04528 17.8219 5.2252 17.8352C5.43813 17.8508 5.66275 17.7695 6.11199 17.607L7.12553 17.2402C7.42216 17.1328 7.5705 17.0791 7.7029 17.0681C7.83294 17.0573 7.91159 17.064 8.03786 17.0969C8.16644 17.1304 8.33956 17.2293 8.68582 17.427C8.71228 17.4421 8.73885 17.4571 8.76554 17.4718C9.12753 17.6719 9.30853 17.772 9.40635 17.8684C9.50241 17.963 9.54975 18.0296 9.60765 18.1514C9.66662 18.2754 9.69445 18.4367 9.75012 18.7594L9.90615 19.6637C9.98895 20.1437 10.0304 20.3837 10.1524 20.5629C10.2555 20.7142 10.3981 20.8344 10.5648 20.9102C10.7621 21 11.0057 21 11.4927 21H12.5073C12.9943 21 13.2378 21 13.4352 20.9102C13.6019 20.8344 13.7445 20.7142 13.8476 20.5629C13.9696 20.3837 14.011 20.1437 14.0938 19.6637L14.2499 18.7594C14.3055 18.4367 14.3334 18.2754 14.3923 18.1514C14.4502 18.0296 14.4976 17.963 14.5936 17.8684C14.6915 17.772 14.8725 17.6719 15.2344 17.4718C15.2611 17.4571 15.2877 17.4421 15.3141 17.427C15.6604 17.2293 15.8335 17.1304 15.9621 17.0969C16.0884 17.064 16.167 17.0573 16.2971 17.0681C16.4295 17.0791 16.5778 17.1328 16.8744 17.2402L17.888 17.607C18.3372 17.7696 18.5619 17.8509 18.7748 17.8352C18.9547 17.8219 19.1277 17.7603 19.2754 17.6567C19.4502 17.5342 19.5728 17.3291 19.8179 16.919L20.2773 16.1504C20.536 15.7175 20.6654 15.501 20.6877 15.2793C20.7065 15.0921 20.6721 14.9034 20.5885 14.7349C20.4895 14.5353 20.2921 14.3783 19.8974 14.0643L19.1726 13.4879C18.9207 13.2876 18.7948 13.1875 18.7159 13.0801C18.6306 12.9641 18.5942 12.8887 18.5564 12.7497C18.5215 12.6211 18.5215 12.414 18.5215 12C18.5215 11.586 18.5215 11.379 18.5564 11.2504C18.5942 11.1114 18.6306 11.036 18.7159 10.9199C18.7948 10.8126 18.9207 10.7124 19.1725 10.5122L19.8974 9.9357C20.2922 9.62176 20.4896 9.46479 20.5886 9.26517C20.6722 9.09664 20.7065 8.90795 20.6877 8.72076C20.6654 8.49906 20.5361 8.28259 20.2773 7.84964L19.8179 7.08102C19.5728 6.67093 19.4503 6.46588 19.2755 6.34332C19.1277 6.23977 18.9548 6.1781 18.7748 6.16486C18.5619 6.14919 18.3373 6.23048 17.888 6.39307L16.8745 6.75989C16.5778 6.86725 16.4295 6.92093 16.2971 6.93195C16.167 6.94278 16.0884 6.93601 15.9621 6.90313C15.8335 6.86965 15.6604 6.77077 15.3142 6.57302C15.2877 6.55791 15.2611 6.54298 15.2345 6.52822C14.8725 6.3281 14.6915 6.22804 14.5936 6.13166C14.4976 6.03703 14.4502 5.97047 14.3923 5.84869C14.3334 5.72467 14.3055 5.56332 14.2499 5.24064L14.0938 4.3363Z" fill="#0F1729"/>
</svg>`;
	}
	/**
	 * Close/X icon for modal close button
	 */
	function getCloseIcon() {
	    return `<svg class="cv-modal-close-icon" fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
    <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
  </svg>`;
	}
	/**
	 * Reset/refresh icon for reset button
	 */
	function getResetIcon() {
	    return `<svg class="cv-btn-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.719 12A10.719 10.719 0 0 1 1.28 12h.838a9.916 9.916 0 1 0 1.373-5H8v1H2V2h1v4.2A10.71 10.71 0 0 1 22.719 12z"/><path fill="none" d="M0 0h24v24H0z"/>
  </svg>`;
	}
	/**
	 * Copy icon for sharing URL button
	 */
	function getCopyIcon() {
	    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="18" height="18" viewBox="0 0 18 18" version="1.1" fill="currentColor">
              <g id="surface1">
                <path d="M 11.273438 0 L 2.546875 0 C 1.746094 0 1.089844 0.613281 1.089844
                1.363281 L 1.089844 10.910156 L 2.546875 10.910156 L 2.546875 1.363281 L 11.273438
                1.363281 Z M 13.453125 2.726562 L 5.453125 2.726562 C 4.65625 2.726562 4 3.339844 4
                4.089844 L 4 13.636719 C 4 14.386719 4.65625 15 5.453125 15 L 13.453125 15 C 14.253906
                15 14.910156 14.386719 14.910156 13.636719 L 14.910156 4.089844 C 14.910156 3.339844
                14.253906 2.726562 13.453125 2.726562 Z M 13.453125 13.636719 L 5.453125 13.636719 L
                5.453125 4.089844 L 13.453125 4.089844 Z M 13.453125 13.636719 "></path>
              </g>
          </svg>`;
	}
	function getTickIcon() {
	    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="2 2 22 22" fill="currentColor">
            <path d="M 19.28125 5.28125 L 9 15.5625 L 4.71875 11.28125 L 3.28125 12.71875 L 8.28125 17.71875 
            L 9 18.40625 L 9.71875 17.71875 L 20.71875 6.71875 Z"></path>
          </svg>`;
	}
	function getNavHeadingOnIcon() {
	    return `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="181" viewBox="0 0 250 181">
            <rect y="34.5001" width="250" height="146" rx="4" stroke="currentColor" stroke-width="10" fill="none"/>
            <line x1="27" y1="62.0001" x2="77" y2="62.0001" stroke="currentColor" stroke-width="5"/>
            <line x1="27" y1="77.8888" x2="77" y2="77.8888" stroke="currentColor" stroke-width="5"/>
            <line x1="27" y1="97.4454" x2="221" y2="97.4454" stroke="currentColor" stroke-width="5"/>
            <line x1="27" y1="114.555" x2="221" y2="114.555" stroke="currentColor" stroke-width="5"/>
            <line x1="27" y1="132.889" x2="221" y2="132.889" stroke="currentColor" stroke-width="5"/>
            <line x1="27" y1="150" x2="221" y2="150" stroke="currentColor" stroke-width="5"/>
            <line x1="247.5" y1="43.0001" x2="247.5" y2="13.0001" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
            <path d="M185 12.5001L247 12.5001" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
            <line x1="204.09" y1="36.6095" x2="181.698" y2="10.0228" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
            <path d="M125 9.50012L181 9.50012" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
            <path d="M144.305 35.2579L120.095 6.56679" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
            <path d="M120 6.50037L64 6.50037" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
            <path d="M87.1957 36.1024L59 2.50008" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
            <path d="M59 2.50037L3 2.50037" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
            <path d="M2.5 38.5001L2.5 3.00012" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
          </svg>`;
	}
	function getNavHeadingOffIcon() {
	    return `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="181" viewBox="0 0 250 181" fill="currentColor">
            <rect y="34.5001" width="250" height="146" rx="4" stroke="currentColor" stroke-width="10" fill="none"/>
            <line x1="27" y1="62" x2="77" y2="62" stroke="currentColor" stroke-width="5"/>
            <line x1="27" y1="77.8887" x2="77" y2="77.8887" stroke="currentColor" stroke-width="5"/>
            <line x1="27" y1="97.4453" x2="221" y2="97.4453" stroke="currentColor" stroke-width="5"/>
            <line x1="27" y1="114.555" x2="221" y2="114.555" stroke="currentColor" stroke-width="5"/>
            <line x1="27" y1="132.889" x2="221" y2="132.889" stroke="currentColor" stroke-width="5"/>
            <line x1="27" y1="150" x2="221" y2="150" stroke="currentColor" stroke-width="5"/>
          </svg>`;
	}
	/**
	 * Transition Icon for Navigation Headings
	 */
	function getNavDashed() {
	    return `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="181" viewBox="0 0 250 181">
            <rect y="34.5001" width="250" height="146" rx="4" stroke="currentColor" stroke-width="10" fill="none"/>
            <line x1="27" y1="62.0001" x2="77" y2="62.0001" stroke="currentColor" stroke-width="5"/>
            <line x1="27" y1="77.8888" x2="77" y2="77.8888" stroke="currentColor" stroke-width="5"/>
            <line x1="27" y1="97.4454" x2="221" y2="97.4454" stroke="currentColor" stroke-width="5"/>
            <line x1="27" y1="114.555" x2="221" y2="114.555" stroke="currentColor" stroke-width="5"/>
            <line x1="27" y1="132.889" x2="221" y2="132.889" stroke="currentColor" stroke-width="5"/>
            <line x1="27" y1="150" x2="221" y2="150" stroke="currentColor" stroke-width="5"/>
            <path d="M245 37.0001V39.5001H250V37.0001H247.5H245ZM250 13.0001C250 11.6194 248.881 10.5001 247.5 10.5001C246.119 10.5001 245 11.6194 245 13.0001H247.5H250ZM250 31.0001C250 29.6194 248.881 28.5001 247.5 28.5001C246.119 28.5001 245 29.6194 245 31.0001H247.5H250ZM245 19.0001C245 20.3808 246.119 21.5001 247.5 21.5001C248.881 21.5001 250 20.3808 250 19.0001H247.5H245ZM247.5 37.0001H250V31.0001H247.5H245V37.0001H247.5ZM247.5 19.0001H250V13.0001H247.5H245V19.0001H247.5Z" fill="currentColor"/>
            <line x1="204.09" y1="36.6095" x2="181.698" y2="10.0228" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 10"/>
            <path d="M125 9.50012L181 9.50012" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 10"/>
            <path d="M144.305 35.2579L120.095 6.56679" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 10"/>
            <path d="M120 6.50037L64 6.50037" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 10"/>
            <path d="M87.1957 36.1024L59 2.50008" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 10"/>
            <path d="M59 2.50037L3 2.50037" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 10"/>
            <path d="M2.5 38.5001L2.5 3.00012" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 10"/>
            <path d="M185 12.5001L247 12.5001" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 10"/>
          </svg>`;
	}
	function getPinIcon(isPinned = false) {
	    const opacity = isPinned ? '1' : '0.6'; // Optional: additional dimming effect
	    return `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" opacity="${opacity}" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(45 8 8)">
        <path d="M10.5 2H12V0H4V2H5.5V6L4 7.5V9H7.2V15H8.8V9H12V7.5L10.5 6V2Z"/>
      </g>
    </svg>
  `.trim();
	}
	function getShareIcon() {
	    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M18 8h-2a1 1 0 0 0 0 2h2v8H6v-8h2a1 1 0 0 0 0-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2z"/>
            <path fill="currentColor" d="M11 6.41V12a1 1 0 0 0 2 0V6.41l1.29 1.3a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42l-3-3a1 1 0 0 0-1.42 0l-3 3a1 1 0 1 0 1.42 1.42L11 6.41z"/>
          </svg>`;
	}
	/**
	 * GitHub icon for footer link
	 */
	function getGitHubIcon() {
	    return `<svg viewBox="0 0 98 96" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/>
          </svg>`;
	}
	function getChevronDownIcon() {
	    return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
	}
	function getChevronUpIcon() {
	    return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
	}

	/** --- Basic renderers --- */
	function renderImage(el, asset) {
	    if (!asset.src)
	        return;
	    el.innerHTML = '';
	    const img = document.createElement('img');
	    img.src = asset.src;
	    img.alt = asset.alt || '';
	    // Apply custom styling if provided
	    if (asset.className) {
	        img.className = asset.className;
	    }
	    if (asset.style) {
	        img.setAttribute('style', asset.style);
	    }
	    // Default styles (can be overridden by asset.style)
	    img.style.maxWidth = img.style.maxWidth || '100%';
	    img.style.height = img.style.height || 'auto';
	    img.style.display = img.style.display || 'block';
	    el.appendChild(img);
	}
	function renderText(el, asset) {
	    if (asset.content != null) {
	        el.textContent = asset.content;
	    }
	    // Apply custom styling if provided
	    if (asset.className) {
	        el.className = asset.className;
	    }
	    if (asset.style) {
	        el.setAttribute('style', asset.style);
	    }
	}
	function renderHtml(el, asset) {
	    if (asset.content != null) {
	        el.innerHTML = asset.content;
	    }
	    // Apply custom styling if provided
	    if (asset.className) {
	        el.className = asset.className;
	    }
	    if (asset.style) {
	        el.setAttribute('style', asset.style);
	    }
	}
	/** --- Unified asset renderer --- */
	function detectAssetType(asset) {
	    // If src exists, it's an image
	    if (asset.src)
	        return 'image';
	    // If content contains HTML tags, it's HTML
	    if (asset.content && /<[^>]+>/.test(asset.content)) {
	        return 'html';
	    }
	    return 'text';
	}
	function renderAssetInto(el, assetId, assetsManager) {
	    const asset = assetsManager.get(assetId);
	    if (!asset)
	        return;
	    const type = asset.type || detectAssetType(asset);
	    switch (type) {
	        case 'image':
	            renderImage(el, asset);
	            break;
	        case 'text':
	            renderText(el, asset);
	            break;
	        case 'html':
	            renderHtml(el, asset);
	            break;
	        default:
	            el.innerHTML = asset.content || String(asset);
	            console.warn('[CustomViews] Unknown asset type:', type);
	    }
	}

	var root_1$9 = from_html(`<div class="cv-toggle-label svelte-1x95rqi"> </div>`);
	var root_2$4 = from_html(`<button class="cv-expand-btn svelte-1x95rqi"><!></button>`);
	var root$a = from_html(`<div><!> <div class="cv-toggle-content svelte-1x95rqi"><div class="cv-toggle-inner svelte-1x95rqi"><!></div></div> <!></div>`);

	const $$css$f = {
		hash: 'svelte-1x95rqi',
		code: ':host {display:block;position:relative;z-index:1;overflow:visible;}\n\n  /* Host visibility control */:host([hidden]) {display:none;}.cv-toggle-wrapper.svelte-1x95rqi {position:relative;width:100%;transition:all 0.3s ease;margin-bottom:4px;}.cv-toggle-wrapper.hidden.svelte-1x95rqi {margin-bottom:0;}.cv-toggle-wrapper.peek-mode.svelte-1x95rqi {margin-bottom:24px;}.cv-toggle-content.svelte-1x95rqi {overflow:hidden;transition:max-height 0.3s ease, opacity 0.3s ease, overflow 0s 0s;\n    /* CSS max-height defaults are handled by inline styles now */}.cv-toggle-inner.svelte-1x95rqi {display:flow-root; /* Ensures margins of children are contained */}\n\n  /* Hidden State */.hidden.svelte-1x95rqi .cv-toggle-content:where(.svelte-1x95rqi) {opacity:0;pointer-events:none;}\n\n  /* Bordered State */.has-border.svelte-1x95rqi {box-sizing:border-box; /* Ensure padding/border doesn\'t increase width */\n    \n    /* Dashed border */border:2px dashed rgba(0, 0, 0, 0.15);border-bottom:none;\n    \n    /* Inner shadow to look like it\'s going into something + outer shadow */box-shadow:0 2px 8px rgba(0, 0, 0, 0.05), /* Subtle outer */\n      inset 0 -15px 10px -10px rgba(0, 0, 0, 0.1); /* Inner bottom shadow */border-radius:8px 8px 0 0;padding:12px 0 0 0; /* bottom 0 px until expanded */margin-top:4px;}\n  \n  /* Visible / Expanded State */.expanded.svelte-1x95rqi .cv-toggle-content:where(.svelte-1x95rqi) {opacity:1;transform:translateY(0);overflow:visible;transition:max-height 0.3s ease, opacity 0.3s ease, overflow 0s 0.3s;}\n\n  /* When expanded, complete the border */.has-border.expanded.svelte-1x95rqi {border-bottom:2px dashed rgba(0, 0, 0, 0.15);border-radius:8px; /* Round all corners */padding-bottom:12px;box-shadow:0 2px 8px rgba(0, 0, 0, 0.05); /* Remove inner shadow when expanded */}\n\n  /* Peek State */.peeking.svelte-1x95rqi .cv-toggle-content:where(.svelte-1x95rqi) {opacity:1;\n    /* Mask for fade out effect */mask-image:linear-gradient(to bottom, black 50%, transparent 100%);-webkit-mask-image:linear-gradient(to bottom, black 50%, transparent 100%);}\n  \n  /* Label Style */.cv-toggle-label.svelte-1x95rqi {position:absolute;top:-12px;left:0;background:#e0e0e0;color:#333;font-size:0.75rem;font-weight:600;padding:2px 8px;border-radius:4px;z-index:10;pointer-events:auto;box-shadow:0 1px 2px rgba(0,0,0,0.1);}\n\n  /* Adjust label position if bordered */.has-border.svelte-1x95rqi .cv-toggle-label:where(.svelte-1x95rqi) {top:-10px;left:0;}\n\n  /* Expand Button */.cv-expand-btn.svelte-1x95rqi {position:absolute;bottom:-24px;left:50%;transform:translateX(-50%);display:flex;background:transparent;border:none;border-radius:50%;padding:4px;width:32px;height:32px;cursor:pointer;z-index:100;align-items:center;justify-content:center;color:#888;transition:all 0.2s ease;}.cv-expand-btn.svelte-1x95rqi:hover {background:rgba(0, 0, 0, 0.05);color:#000;transform:translateX(-50%) scale(1.1);}\n\n  /* Accessing SVG inside button - might need :global if SVG is injected as HTML or just plain styles since it adheres to current scope */.cv-expand-btn.svelte-1x95rqi svg {display:block;opacity:0.6;width:24px;height:24px;transition:opacity 0.2s;}.cv-expand-btn.svelte-1x95rqi:hover svg {opacity:1;}'
	};

	function Toggle($$anchor, $$props) {
		push($$props, true);
		append_styles$1($$anchor, $$css$f);

		// Props using Svelte 5 runes
		let toggleId = prop($$props, 'toggleId', 7, ''),
			assetId = prop($$props, 'assetId', 7, ''),
			showPeekBorder = prop($$props, 'showPeekBorder', 7, false),
			showLabel = prop($$props, 'showLabel', 7, false);

		// Derive toggle IDs from toggle-id prop (can have multiple space-separated IDs)
		let toggleIds = user_derived(() => (toggleId() || '').split(/\s+/).filter(Boolean));

		let toggleConfig = user_derived(() => store.config.toggles?.find((t) => t.toggleId === get(toggleIds)[0]));

		user_effect(() => {
			get(toggleIds).forEach((id) => store.registerToggle(id));
		});

		// Derive label text from config
		let labelText = user_derived(() => {
			if (!get(toggleConfig)) return '';

			return get(toggleConfig).label || get(toggleIds)[0];
		});

		let localExpanded = state(false);
		let isUnconstrained = state(false /* New state to track if we can release max-height */);
		let hasRendered = state(false);
		let contentEl;
		let innerEl;
		let scrollHeight = state(0);

		// Derive visibility from store state
		let showState = user_derived(() => {
			// Default to SHOWN if config hasn't loaded yet (prevent pop-in)
			if (!store.config.toggles) return true;

			const shownToggles = store.state.shownToggles ?? [];

			return get(toggleIds).some((id) => shownToggles.includes(id));
		});

		// Derive peek state from store state
		let peekState = user_derived(() => {
			const peekToggles = store.state.peekToggles ?? [];

			return !get(showState) && get(toggleIds).some((id) => peekToggles.includes(id));
		});

		const PEEK_HEIGHT = 70;
		let isSmallContent = state(false);

		// Setup ResizeObserver to track content height changes (e.g. images loading, window resize)
		user_effect(() => {
			if (!contentEl) return;

			const observer = new ResizeObserver(() => {
				// We measure the inner element's height
				// contentEl is the window, innerEl is the content
				if (innerEl) {
					set(scrollHeight, innerEl.offsetHeight, true);
				}

				// Always track small content state to avoid race conditions/stale state
				if (get(scrollHeight) > 0) {
					if (get(scrollHeight) <= PEEK_HEIGHT) {
						set(isSmallContent, true);
					} else if (!get(isSmallContent)) {
						// Only set to false if it wasn't already true (latch behavior)
						// This ensures if it STARTS small, growing won't add the button.
						set(isSmallContent, false);
					}
				}
			});

			if (innerEl) {
				observer.observe(innerEl);
				set(scrollHeight, innerEl.offsetHeight, true);
			}

			return () => {
				observer.disconnect();
			};
		});

		let showFullContent = user_derived(() => get(showState) || get(peekState) && get(localExpanded) || get(peekState) && get(isSmallContent));

		// Reset unconstrained state when toggling
		user_effect(() => {
			if (get(showFullContent)) {
				// Expanding: start constrained (to animate), will unlock on transitionend
				set(isUnconstrained, false);
			} else {
				// Collapsing: must recapture height immediately (snap) or stay constrained
				set(isUnconstrained, false);
			}
		});

		// Only show peek styling (mask) if it's peeking, not expanded locally, AND content is actually taller than peek height
		let showPeekContent = user_derived(() => !get(showState) && get(peekState) && !get(localExpanded) && !get(isSmallContent));

		let isHidden = user_derived(() => !get(showState) && !get(peekState));

		// Calculate dynamic max-height for animation
		let currentMaxHeight = user_derived(() => {
			if (get(isHidden)) return '0px';
			if (get(isUnconstrained) && get(showFullContent)) return 'none'; /* Release constraint when stable */
			if (get(showPeekContent)) return `${PEEK_HEIGHT}px`;
			if (get(showFullContent)) return get(scrollHeight) > 0 ? `${get(scrollHeight)}px` : '9999px';

			return '0px';
		});

		function handleTransitionEnd(e) {
			// Only care about max-height transitions on the content element
			if (e.propertyName !== 'max-height' || e.target !== contentEl) return;

			// If we finished expanding, release the height constraint
			if (get(showFullContent)) {
				set(isUnconstrained, true);
			}
		}

		function toggleExpand(e) {
			e.stopPropagation();
			set(localExpanded, !get(localExpanded));
		}

		// Reactive asset rendering - renders assets when toggle becomes visible
		user_effect(() => {
			if (get(showFullContent) && assetId() && !get(hasRendered) && store.assetsManager && contentEl) {
				renderAssetInto(contentEl, assetId(), store.assetsManager);
				set(hasRendered, true);
			}
		});

		var $$exports = {
			get toggleId() {
				return toggleId();
			},

			set toggleId($$value = '') {
				toggleId($$value);
				flushSync();
			},

			get assetId() {
				return assetId();
			},

			set assetId($$value = '') {
				assetId($$value);
				flushSync();
			},

			get showPeekBorder() {
				return showPeekBorder();
			},

			set showPeekBorder($$value = false) {
				showPeekBorder($$value);
				flushSync();
			},

			get showLabel() {
				return showLabel();
			},

			set showLabel($$value = false) {
				showLabel($$value);
				flushSync();
			}
		};

		var div = root$a();
		let classes;
		var node = child(div);

		{
			var consequent = ($$anchor) => {
				var div_1 = root_1$9();
				var text = child(div_1, true);

				reset(div_1);
				template_effect(() => set_text(text, get(labelText)));
				append($$anchor, div_1);
			};

			if_block(node, ($$render) => {
				if (showLabel() && get(labelText) && !get(isHidden)) $$render(consequent);
			});
		}

		var div_2 = sibling(node, 2);
		let styles;
		var div_3 = child(div_2);
		var node_1 = child(div_3);

		slot(node_1, $$props, 'default', {});
		reset(div_3);
		bind_this(div_3, ($$value) => innerEl = $$value, () => innerEl);
		reset(div_2);
		bind_this(div_2, ($$value) => contentEl = $$value, () => contentEl);

		var node_2 = sibling(div_2, 2);

		{
			var consequent_1 = ($$anchor) => {
				var button = root_2$4();

				button.__click = toggleExpand;

				var node_3 = child(button);

				html(node_3, () => get(localExpanded) ? getChevronUpIcon() : getChevronDownIcon());
				reset(button);
				template_effect(() => set_attribute(button, 'aria-label', get(localExpanded) ? "Collapse content" : "Expand content"));
				append($$anchor, button);
			};

			if_block(node_2, ($$render) => {
				if (get(peekState) && !get(isSmallContent)) $$render(consequent_1);
			});
		}

		reset(div);

		template_effect(() => {
			classes = set_class(div, 1, 'cv-toggle-wrapper svelte-1x95rqi', null, classes, {
				expanded: get(showFullContent) && !get(showPeekContent),
				peeking: get(showPeekContent),
				'peek-mode': get(peekState),
				hidden: get(isHidden),
				'has-border': showPeekBorder() && get(peekState)
			});

			styles = set_style(div_2, '', styles, { 'max-height': get(currentMaxHeight) });
		});

		event('transitionend', div_2, handleTransitionEnd);
		append($$anchor, div);

		return pop($$exports);
	}

	delegate(['click']);

	customElements.define('cv-toggle', create_custom_element(
		Toggle,
		{
			toggleId: { attribute: 'toggle-id', reflect: true, type: 'String' },
			assetId: { attribute: 'asset-id', reflect: true, type: 'String' },

			showPeekBorder: {
				attribute: 'show-peek-border',
				reflect: true,
				type: 'Boolean'
			},

			showLabel: { attribute: 'show-label', reflect: true, type: 'Boolean' }
		},
		['default'],
		[],
		true
	));

	var root$9 = from_html(`<div><!></div>`);

	const $$css$e = {
		hash: 'svelte-17fgzpj',
		code: ':host {display:block;}:host(.cv-hidden) {display:none !important;}:host(.cv-visible) {display:block !important;}:host([active="true"]) {display:block;}.cv-tab-content.svelte-17fgzpj {display:none;\n    animation: svelte-17fgzpj-fade-in 0.2s ease-in-out;padding-top:1rem;padding-bottom:0.5rem;padding-left:0;padding-right:0;}.cv-tab-content.active.svelte-17fgzpj {display:block;}\n\n  /* Hide cv-tab-header source element; content is extracted to nav link */.svelte-17fgzpj::slotted(cv-tab-header) {display:none !important;}\n\n  /* Allow cv-tab-body to flow naturally */.svelte-17fgzpj::slotted(cv-tab-body) {display:block;}\n\n  @keyframes svelte-17fgzpj-fade-in {\n    from { opacity: 0; }\n    to { opacity: 1; }\n  }'
	};

	function Tab($$anchor, $$props) {
		push($$props, true);
		append_styles$1($$anchor, $$css$e);

		// Props using Svelte 5 runes
		// tabId and header are used in TabGroup directly.
		// let { active = false, tabId = '', header = '' }: { active?: boolean; tabId?: string; header?: string } = $props();
		let active = prop($$props, 'active', 7, false);

		var $$exports = {
			get active() {
				return active();
			},

			set active($$value = false) {
				active($$value);
				flushSync();
			}
		};

		var div = root$9();
		let classes;
		var node = child(div);

		slot(node, $$props, 'default', {});
		reset(div);
		template_effect(() => classes = set_class(div, 1, 'cv-tab-content svelte-17fgzpj', null, classes, { active: active() }));
		append($$anchor, div);

		return pop($$exports);
	}

	customElements.define('cv-tab', create_custom_element(
		Tab,
		{
			tabId: { attribute: 'tab-id', reflect: true, type: 'String' },
			header: { attribute: 'header', reflect: true, type: 'String' },
			active: {}
		},
		['default'],
		[],
		true
	));

	var root_2$3 = from_html(`<li class="nav-item svelte-1630cmg"><a role="tab" title="Double-click a tab to 'pin' it in all similar tab groups."><span class="cv-tab-header-container svelte-1630cmg"><span class="cv-tab-header-text svelte-1630cmg"><!></span> <span class="cv-tab-pin-icon svelte-1630cmg"><!></span></span></a></li>`);
	var root_1$8 = from_html(`<ul class="cv-tabs-nav nav-tabs svelte-1630cmg" role="tablist"></ul>`);
	var root_3$2 = from_html(`<link rel="stylesheet"/>`);
	var root$8 = from_html(`<div class="cv-tabgroup-container"><!> <!> <div class="cv-tabgroup-content"><!></div> <div class="cv-tabgroup-bottom-border svelte-1630cmg"></div></div>`);

	const $$css$d = {
		hash: 'svelte-1630cmg',
		code: ':host {display:block;margin-bottom:24px;}\n  \n  /* Tab navigation styles */ul.nav-tabs.svelte-1630cmg {display:flex;flex-wrap:wrap;padding-left:0;margin-top:0.5rem;margin-bottom:0;list-style:none;border-bottom:1px solid #dee2e6;align-items:stretch;}.nav-item.svelte-1630cmg {margin-bottom:-1px;list-style:none;display:flex;align-items:stretch;}.nav-link.svelte-1630cmg {display:flex;align-items:center;justify-content:center;padding:0.5rem 1rem;color:#495057;text-decoration:none;background-color:transparent;border:1px solid transparent;border-top-left-radius:0.25rem;border-top-right-radius:0.25rem;transition:color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;cursor:pointer;min-height:2.5rem;box-sizing:border-box;}.nav-link.svelte-1630cmg p {margin:0;display:inline;}.nav-link.svelte-1630cmg:hover,\n  .nav-link.svelte-1630cmg:focus {border-color:#e9ecef #e9ecef #dee2e6;isolation:isolate;}.nav-link.active.svelte-1630cmg {color:#495057;background-color:#fff;border-color:#dee2e6 #dee2e6 #fff;}.nav-link.svelte-1630cmg:focus {outline:0;}.cv-tab-header-container.svelte-1630cmg {display:flex;align-items:center;gap:6px;}.cv-tab-header-text.svelte-1630cmg {flex:1;}.cv-tab-pin-icon.svelte-1630cmg {display:inline-flex;align-items:center;line-height:0;flex-shrink:0;}.cv-tab-pin-icon.svelte-1630cmg svg {vertical-align:middle;width:14px;height:14px;}.cv-tabgroup-bottom-border.svelte-1630cmg {border-bottom:1px solid #dee2e6;}\n\n  @media print {ul.cv-tabs-nav.svelte-1630cmg {display:none !important;}\n  }'
	};

	function TabGroup($$anchor, $$props) {
		push($$props, true);
		append_styles$1($$anchor, $$css$d);

		//  ID of the tabgroup Group
		let groupId = prop($$props, 'groupId', 7);

		user_effect(() => {
			if (groupId()) store.registerTabGroup(groupId());
		});

		let tabs = state(proxy([]));
		let contentWrapper = state(void 0);
		let slotEl = state(null);
		let initialized = state(false);

		// Local active tab state (independent per group instance)
		let localActiveTabId = state('');

		// Derive pinnedTab from store (shared across groups with same ID)
		let pinnedTab = user_derived(() => {
			const tabs$ = store.state.tabs ?? {};

			return groupId() && tabs$[groupId()] ? tabs$[groupId()] : null;
		});

		// Track the last seen store state to detect real changes
		let lastSeenStoreState = state(null);

		// Authoritative Sync: Only sync when store actually changes
		user_effect(() => {
			// If store state has changed from what we last saw
			// Note: strict inequality works here because both are strings or null
			if (get(pinnedTab) !== get(lastSeenStoreState)) {
				set(lastSeenStoreState, get(pinnedTab), true);

				// If there is a pinned tab, it overrides local state
				if (get(pinnedTab)) {
					// Check if we actually need to update (avoid redundant DOM work)
					if (get(localActiveTabId) !== get(pinnedTab)) {
						set(localActiveTabId, get(pinnedTab), true);
						updateVisibility();
					}
				}
			}
		});

		// Sync isTabGroupNavHeadingVisible from store
		let navHeadingVisible = user_derived(() => store.isTabGroupNavHeadingVisible);

		// Icons
		const pinIconHtml = getPinIcon(true);

		onMount(() => {
			if (get(contentWrapper)) {
				set(slotEl, get(contentWrapper).querySelector('slot'), true);

				if (get(slotEl)) {
					get(slotEl).addEventListener('slotchange', handleSlotChange);
					handleSlotChange();
				}
			}
		});

		function splitTabIds(tabId) {
			return tabId.split(/[\s|]+/).filter((id) => id.trim() !== '').map((id) => id.trim());
		}

		// Todo: For handleSlotChange(), consider if there is a svelte way 
		// to do this without the need for the slotchange event.
		/**
		 * Handler for the slotchange event.
		 * Scans the assigned elements in the slot to find `<cv-tab>` components.
		 * Builds the internal `tabs` state used to render the navigation.
		 * Also initializes the active tab if not already set.
		 */
		function handleSlotChange() {
			if (!get(slotEl)) return;

			const elements = get(slotEl).assignedElements().filter((el) => el.tagName.toLowerCase() === 'cv-tab');

			set(
				tabs,
				elements.map((el, index) => {
					const element = el;
					let rawId = element.getAttribute('tab-id');

					// If tab has no tab-id, generate one based on position
					if (!rawId) {
						rawId = `${groupId() || 'tabgroup'}-tab-${index}`;
						element.setAttribute('data-cv-internal-id', rawId);
					}

					const splitIds = splitTabIds(rawId);
					const primaryId = splitIds[0] || rawId;

					// Extract Header
					let header = '';

					// Check for <cv-tab-header>
					const headerEl = element.querySelector('cv-tab-header');

					if (headerEl) {
						header = headerEl.innerHTML.trim();
					} else {
						// Attribute syntax
						header = element.getAttribute('header') || '';

						if (!header) {
							// Fallback to tab-id or default
							header = element.getAttribute('tab-id') ? primaryId : `Tab ${index + 1}`;
						}
					}

					return { id: primaryId, rawId, header, element };
				}),
				true
			);

			if (!get(initialized) && get(tabs).length > 0) {
				// Initialize active tab by dispatching event if none is set
				if (!get(localActiveTabId)) {
					const firstTabId = get(tabs)[0].id;

					set(localActiveTabId, firstTabId, true);
				} else {
					updateVisibility();
				}

				set(initialized, true);
			} else if (get(initialized)) {
				// Re-run visibility in case new tabs matched current activeTab
				updateVisibility();
			}
		}

		/**
		 * Updates the visibility of the child `<cv-tab>` elements based on the current `activeTab`.
		 * Sets the `active` attribute and `cv-visible`/`cv-hidden` classes on the child elements.
		 */
		function updateVisibility() {
			if (!get(tabs).length) return;

			get(tabs).forEach((tab) => {
				const splitIds = splitTabIds(tab.rawId);
				const isActive = splitIds.includes(get(localActiveTabId));

				// Set property directly to trigger Svelte component reactivity
				tab.element.active = isActive;
			});
		}

		/**
		 * Handles click events on the navigation tabs.
		 * Updates the local active tab (visibility is updated automatically via $effect).
		 */
		function handleTabClick(tabId, event) {
			event.preventDefault();

			// Optimistic Update: Update local state immediately
			if (get(localActiveTabId) !== tabId) {
				set(localActiveTabId, tabId, true);
				updateVisibility();
			}
		}

		/**
		 * Handles double-click events on the navigation tabs.
		 * Updates the store to "pin" the tab globally across all tab groups with the same ID.
		 */
		function handleTabDoubleClick(tabId, event) {
			event.preventDefault();

			if (!groupId()) return;

			// Update store directly - this will sync to all tab groups with same group-id
			store.setPinnedTab(groupId(), tabId);
		}

		var $$exports = {
			get groupId() {
				return groupId();
			},

			set groupId($$value) {
				groupId($$value);
				flushSync();
			}
		};

		var div = root$8();
		var node = child(div);

		{
			var consequent = ($$anchor) => {
				var ul = root_1$8();

				each(ul, 21, () => get(tabs), index, ($$anchor, tab) => {
					const splitIds = user_derived(() => splitTabIds(get(tab).rawId));
					const isActive = user_derived(() => get(splitIds).includes(get(localActiveTabId)));
					const isPinned = user_derived(() => get(pinnedTab) && get(splitIds).includes(get(pinnedTab)));
					var li = root_2$3();
					var a = child(li);
					let classes;

					a.__click = (e) => handleTabClick(get(tab).id, e);
					a.__dblclick = (e) => handleTabDoubleClick(get(tab).id, e);

					var span = child(a);
					var span_1 = child(span);
					var node_1 = child(span_1);

					html(node_1, () => get(tab).header);
					reset(span_1);

					var span_2 = sibling(span_1, 2);
					let styles;
					var node_2 = child(span_2);

					html(node_2, () => pinIconHtml);
					reset(span_2);
					reset(span);
					reset(a);
					reset(li);

					template_effect(() => {
						classes = set_class(a, 1, 'nav-link svelte-1630cmg', null, classes, { active: get(isActive) });
						set_attribute(a, 'href', '#' + get(tab).id);
						set_attribute(a, 'aria-selected', get(isActive));
						set_attribute(a, 'data-tab-id', get(tab).id);
						set_attribute(a, 'data-raw-tab-id', get(tab).rawId);
						set_attribute(a, 'data-group-id', groupId());
						styles = set_style(span_2, '', styles, { display: get(isPinned) ? 'inline-flex' : 'none' });
					});

					append($$anchor, li);
				});

				reset(ul);
				append($$anchor, ul);
			};

			if_block(node, ($$render) => {
				if (get(tabs).length > 0 && get(navHeadingVisible)) $$render(consequent);
			});
		}

		var node_3 = sibling(node, 2);

		each(node_3, 16, () => Array.from(document.querySelectorAll('link[rel="stylesheet"]')), index, ($$anchor, link) => {
			var link_1 = root_3$2();

			template_effect(() => set_attribute(link_1, 'href', link.href));
			append($$anchor, link_1);
		});

		var div_1 = sibling(node_3, 2);
		var node_4 = child(div_1);

		slot(node_4, $$props, 'default', {});
		reset(div_1);
		bind_this(div_1, ($$value) => set(contentWrapper, $$value), () => get(contentWrapper));
		next(2);
		reset(div);
		append($$anchor, div);

		return pop($$exports);
	}

	delegate(['click', 'dblclick']);

	customElements.define('cv-tabgroup', create_custom_element(
		TabGroup,
		{
			groupId: { attribute: 'group-id', reflect: true, type: 'String' }
		},
		['default'],
		[],
		true
	));

	enable_legacy_mode_flag();

	const $$css$c = {
		hash: 'svelte-17rs3z0',
		code: ':host {display:none; /* Semantic container only, usually read by parent and hidden */}'
	};

	function TabHeader($$anchor, $$props) {
		append_styles$1($$anchor, $$css$c);

		var fragment = comment();
		var node = first_child(fragment);

		slot(node, $$props, 'default', {});
		append($$anchor, fragment);
		// No logic needed, just a container
	}

	customElements.define('cv-tab-header', create_custom_element(TabHeader, {}, ['default'], [], true));

	const $$css$b = { hash: 'svelte-zu6cbf', code: ':host {display:block;}' };

	function TabBody($$anchor, $$props) {
		append_styles$1($$anchor, $$css$b);

		var fragment = comment();
		var node = first_child(fragment);

		slot(node, $$props, 'default', {});
		append($$anchor, fragment);
		// No logic needed, just a container
	}

	customElements.define('cv-tab-body', create_custom_element(TabBody, {}, ['default'], [], true));

	function DefinePlaceholder($$anchor, $$props) {
		push($$props, true);

		let name = prop($$props, 'name', 7),
			settingsLabel = prop($$props, 'settingsLabel', 7),
			settingsHint = prop($$props, 'settingsHint', 7),
			defaultValue = prop($$props, 'defaultValue', 7);

		user_effect(() => {
			// Capture dependencies (props) outside untrack
			const def = {
				name: name(),
				settingsLabel: settingsLabel() ?? name(),
				settingsHint: settingsHint(),
				defaultValue: defaultValue()
			};

			untrack(() => {
				try {
					placeholderRegistryStore.register(def);
				} catch(err) {
					console.error('[CustomViews] Error registering placeholder:', err);
				}
			});
		});

		var $$exports = {
			get name() {
				return name();
			},

			set name($$value) {
				name($$value);
				flushSync();
			},

			get settingsLabel() {
				return settingsLabel();
			},

			set settingsLabel($$value) {
				settingsLabel($$value);
				flushSync();
			},

			get settingsHint() {
				return settingsHint();
			},

			set settingsHint($$value) {
				settingsHint($$value);
				flushSync();
			},

			get defaultValue() {
				return defaultValue();
			},

			set defaultValue($$value) {
				defaultValue($$value);
				flushSync();
			}
		};

		return pop($$exports);
	}

	customElements.define('cv-define-placeholder', create_custom_element(
		DefinePlaceholder,
		{
			name: { attribute: 'name', type: 'String' },
			settingsLabel: { attribute: 'settings-label', type: 'String' },
			settingsHint: { attribute: 'settings-hint', type: 'String' },
			defaultValue: { attribute: 'default-value', type: 'String' }
		},
		[],
		[],
		true
	));

	/**
	 * Main CustomViews class for initializing and managing custom views
	 */
	class CustomViews {
	    /**
	     * Entry Point to use CustomViews
	     * @param opts Initialization options including config object and assets path
	     * @returns Promise resolving to the CustomViewsCore instance or null if initialization fails
	     */
	    static async init(opts) {
	        // Load assets JSON if provided
	        let assetsManager;
	        const baseURL = opts.baseURL || '';
	        if (opts.assetsJsonPath) {
	            const assetsPath = prependBaseUrl(opts.assetsJsonPath, baseURL);
	            try {
	                const assetsJson = await (await fetch(assetsPath)).json();
	                assetsManager = new AssetsManager(assetsJson, baseURL);
	            }
	            catch (error) {
	                console.error(`[CustomViews] Failed to load assets JSON from ${assetsPath}:`, error);
	                assetsManager = new AssetsManager({}, baseURL);
	            }
	        }
	        else {
	            assetsManager = new AssetsManager({}, baseURL);
	        }
	        // Use provided config or create a minimal default one
	        let config;
	        if (opts.config) {
	            config = opts.config;
	        }
	        else {
	            console.error("No config provided, using minimal default config");
	            // Create a minimal default config
	            config = {};
	        }
	        const coreOptions = {
	            assetsManager,
	            config: config,
	            rootEl: opts.rootEl,
	        };
	        if (opts.showUrl !== undefined) {
	            coreOptions.showUrl = opts.showUrl;
	        }
	        const core = new CustomViewsCore(coreOptions);
	        core.init();
	        return core;
	    }
	}

	var root$7 = from_html(`<div><div role="alert"><button class="close-btn svelte-1jgbyi0" aria-label="Dismiss intro">×</button> <p class="text svelte-1jgbyi0"> </p></div></div>`);

	const $$css$a = {
		hash: 'svelte-1jgbyi0',
		code: '\n  /* Animation */\n  @keyframes svelte-1jgbyi0-popIn {\n    0% { opacity: 0; transform: scale(0.9) translateY(-50%); }\n    100% { opacity: 1; transform: scale(1) translateY(-50%); }\n  }\n\n  /* Reset transform for top/bottom positions */\n  @keyframes svelte-1jgbyi0-popInVertical {\n    0% { opacity: 0; transform: scale(0.9); }\n    100% { opacity: 1; transform: scale(1); }\n  }\n\n  /* Simplified Pulse Animation - Shadow Only */\n  @keyframes svelte-1jgbyi0-pulse {\n    0% { transform: scale(1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 0 rgba(62, 132, 244, 0.7); }\n    50% { transform: scale(1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 10px rgba(62, 132, 244, 0); }\n    100% { transform: scale(1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 0 rgba(62, 132, 244, 0); }\n  }\n\n  /* Wrapper handles Positioning & Entry Animation */.cv-callout-wrapper.svelte-1jgbyi0 {position:fixed;z-index:9999;\n    \n    /* Default animation (centered ones) */\n    animation: svelte-1jgbyi0-popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;}\n\n  /* Inner handles Visuals & Pulse Animation */.cv-callout.svelte-1jgbyi0 {background:var(--cv-callout-bg, var(--cv-bg));padding:1rem 1.25rem;border-radius:0.5rem;box-shadow:0 4px 6px -1px var(--cv-shadow), 0 2px 4px -1px var(--cv-shadow); /* adapt shadow? */max-width:250px;font-size:0.9rem;line-height:1.5;color:var(--cv-callout-text, var(--cv-text));display:flex;align-items:flex-start;gap:0.75rem;font-family:inherit;border:2px solid var(--cv-border);}\n\n  /* Apply pulse to inner callout if enabled */.cv-callout.cv-pulse.svelte-1jgbyi0 {\n    animation: svelte-1jgbyi0-pulse 2s infinite 0.5s;}\n\n  /* Arrow Base */.cv-callout.svelte-1jgbyi0::before {content:\'\';position:absolute;width:1rem;height:1rem;background:var(--cv-callout-bg, var(--cv-bg));transform:rotate(45deg);border:2px solid var(--cv-border);z-index:-1;}.close-btn.svelte-1jgbyi0 {background:transparent;border:none;color:currentColor;opacity:0.7;font-size:1.25rem;line-height:1;cursor:pointer;padding:0;margin:-0.25rem -0.5rem 0 0;transition:opacity 0.15s;flex-shrink:0;}.close-btn.svelte-1jgbyi0:hover {color:currentColor;opacity:1;}.text.svelte-1jgbyi0 {margin:0;flex:1;font-weight:500;}\n\n  /* \n     Position Specifics (Applied to Wrapper)\n  */\n\n  /* Right-side positions (Icon on Right -> Callout on Left) */.pos-top-right.svelte-1jgbyi0, .pos-middle-right.svelte-1jgbyi0, .pos-bottom-right.svelte-1jgbyi0 {right:80px;}.pos-top-right.svelte-1jgbyi0, .pos-bottom-right.svelte-1jgbyi0 {\n     animation-name: svelte-1jgbyi0-popInVertical;}\n  \n  /* X Button Spacing Adjustments */.pos-top-right.svelte-1jgbyi0 .close-btn:where(.svelte-1jgbyi0), \n  .pos-middle-right.svelte-1jgbyi0 .close-btn:where(.svelte-1jgbyi0), \n  .pos-bottom-right.svelte-1jgbyi0 .close-btn:where(.svelte-1jgbyi0) {margin-right:0;margin-left:-0.5rem;}\n\n  /* Left-side positions (Icon on Left -> Callout on Right) */.pos-top-left.svelte-1jgbyi0, .pos-middle-left.svelte-1jgbyi0, .pos-bottom-left.svelte-1jgbyi0 {left:80px;}.pos-top-left.svelte-1jgbyi0 .close-btn:where(.svelte-1jgbyi0), \n  .pos-middle-left.svelte-1jgbyi0 .close-btn:where(.svelte-1jgbyi0), \n  .pos-bottom-left.svelte-1jgbyi0 .close-btn:where(.svelte-1jgbyi0) {order:2; /* Move to end */margin-right:-0.5rem;margin-left:0;}.pos-top-left.svelte-1jgbyi0, .pos-bottom-left.svelte-1jgbyi0 {\n     animation-name: svelte-1jgbyi0-popInVertical;}\n\n  /* Vertical Alignment */.pos-middle-right.svelte-1jgbyi0, .pos-middle-left.svelte-1jgbyi0 {top:50%;\n    /* transform handled by popIn animation (translateY -50%) */}.pos-top-right.svelte-1jgbyi0, .pos-top-left.svelte-1jgbyi0 {top:20px;}.pos-bottom-right.svelte-1jgbyi0, .pos-bottom-left.svelte-1jgbyi0 {bottom:20px;}\n\n\n  /* Arrow Positioning (Child of .callout, dependent on Wrapper .pos-*) */\n  \n  /* Pointing Right */.pos-top-right.svelte-1jgbyi0 .cv-callout:where(.svelte-1jgbyi0)::before, \n  .pos-middle-right.svelte-1jgbyi0 .cv-callout:where(.svelte-1jgbyi0)::before, \n  .pos-bottom-right.svelte-1jgbyi0 .cv-callout:where(.svelte-1jgbyi0)::before {right:-0.5rem;border-left:none;border-bottom:none;}\n\n  /* Pointing Left */.pos-top-left.svelte-1jgbyi0 .cv-callout:where(.svelte-1jgbyi0)::before, \n  .pos-middle-left.svelte-1jgbyi0 .cv-callout:where(.svelte-1jgbyi0)::before, \n  .pos-bottom-left.svelte-1jgbyi0 .cv-callout:where(.svelte-1jgbyi0)::before {left:-0.5rem;border-right:none;border-top:none;}\n\n  /* Vertical placement of arrow */.pos-middle-right.svelte-1jgbyi0 .cv-callout:where(.svelte-1jgbyi0)::before, .pos-middle-left.svelte-1jgbyi0 .cv-callout:where(.svelte-1jgbyi0)::before {top:50%;margin-top:-0.5rem;}.pos-top-right.svelte-1jgbyi0 .cv-callout:where(.svelte-1jgbyi0)::before, .pos-top-left.svelte-1jgbyi0 .cv-callout:where(.svelte-1jgbyi0)::before {top:1.25rem;}.pos-bottom-right.svelte-1jgbyi0 .cv-callout:where(.svelte-1jgbyi0)::before, .pos-bottom-left.svelte-1jgbyi0 .cv-callout:where(.svelte-1jgbyi0)::before {bottom:1.25rem;}\n\n  @media print {.cv-callout-wrapper.svelte-1jgbyi0 {display:none !important;}\n  }'
	};

	function IntroCallout($$anchor, $$props) {
		append_styles$1($$anchor, $$css$a);

		let position = prop($$props, 'position', 3, 'middle-left'),
			message = prop($$props, 'message', 3, 'Customize your reading experience here.'),
			onclose = prop($$props, 'onclose', 3, () => {}),
			enablePulse = prop($$props, 'enablePulse', 3, true),
			backgroundColor = prop($$props, 'backgroundColor', 3, undefined),
			textColor = prop($$props, 'textColor', 3, undefined);

		var // Map widget position to callout position logic
		/*
		  Positions need to be adjusted based on the widget icon location.
		  "right" positions -> callout appears to the left of the icon
		  "left" positions -> callout appears to the right of the icon
		  "top" -> aligned top
		  "bottom" -> aligned bottom
		*/
		div = root$7();

		var div_1 = child(div);
		let styles;
		var button = child(div_1);

		button.__click = function (...$$args) {
			onclose()?.apply(this, $$args);
		};

		var p = sibling(button, 2);
		var text = child(p, true);

		reset(p);
		reset(div_1);
		reset(div);

		template_effect(() => {
			set_class(div, 1, `cv-callout-wrapper pos-${position() ?? ''}`, 'svelte-1jgbyi0');
			set_class(div_1, 1, `cv-callout ${enablePulse() ? 'cv-pulse' : ''}`, 'svelte-1jgbyi0');

			styles = set_style(div_1, '', styles, {
				'--cv-callout-bg': backgroundColor(),
				'--cv-callout-text': textColor()
			});

			set_text(text, message());
		});

		append($$anchor, div);
	}

	delegate(['click']);

	var root$6 = from_html(`<div role="button" tabindex="0" aria-label="Open Custom Views Settings"><span class="cv-gear svelte-11erbyi">⚙</span></div>`);

	const $$css$9 = {
		hash: 'svelte-11erbyi',
		code: '.cv-settings-icon.svelte-11erbyi {position:fixed;background:var(--cv-icon-bg, rgba(255, 255, 255, 0.92));color:var(--cv-icon-color, rgba(0, 0, 0, 0.9));opacity:var(--cv-icon-opacity, 0.6);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:bold;cursor:grab; /* Default cursor */box-shadow:0 4px 12px rgba(0, 0, 0, 0.15);border:2px solid rgba(0, 0, 0, 0.2);z-index:9998;transition:width 0.3s ease, background 0.3s ease, color 0.3s ease, opacity 0.3s ease, border-color 0.3s ease; /* Removed transform transition to allow smooth dragging */touch-action:none; /* Crucial for touch dragging */font-family:-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;box-sizing:border-box;user-select:none; /* Prevent text selection while dragging */}.cv-settings-icon.svelte-11erbyi:active {cursor:grabbing;}.cv-settings-icon.svelte-11erbyi:hover {background:var(--cv-icon-bg, rgba(255, 255, 255, 1));color:var(--cv-icon-color, rgba(0, 0, 0, 1));opacity:1;border-color:rgba(0, 0, 0, 0.3);}\n\n  /* Top-right */.cv-settings-top-right.svelte-11erbyi {top:20px;right:0;border-radius:18px 0 0 18px;padding-left:6px;justify-content:flex-start;border-right:none;}\n\n  /* Top-left */.cv-settings-top-left.svelte-11erbyi {top:20px;left:0;border-radius:0 18px 18px 0;padding-right:6px;justify-content:flex-end;border-left:none;}\n\n  /* Bottom-right */.cv-settings-bottom-right.svelte-11erbyi {bottom:20px;right:0;border-radius:18px 0 0 18px;padding-left:6px;justify-content:flex-start;border-right:none;}\n\n  /* Bottom-left */.cv-settings-bottom-left.svelte-11erbyi {bottom:20px;left:0;border-radius:0 18px 18px 0;padding-right:6px;justify-content:flex-end;border-left:none;}\n\n  /* Middle-left */.cv-settings-middle-left.svelte-11erbyi {top:50%;left:0;\n    /* transform handled by inline style now */border-radius:0 18px 18px 0;padding-right:6px;justify-content:flex-end;border-left:none;}\n\n  /* Middle-right */.cv-settings-middle-right.svelte-11erbyi {top:50%;right:0;\n    /* transform handled by inline style now */border-radius:18px 0 0 18px;padding-left:6px;justify-content:flex-start;border-right:none;}.cv-settings-top-right.svelte-11erbyi,\n  .cv-settings-middle-right.svelte-11erbyi,\n  .cv-settings-bottom-right.svelte-11erbyi,\n  .cv-settings-top-left.svelte-11erbyi,\n  .cv-settings-middle-left.svelte-11erbyi,\n  .cv-settings-bottom-left.svelte-11erbyi {height:36px;width:36px;}.cv-settings-middle-right.svelte-11erbyi:hover,\n  .cv-settings-top-right.svelte-11erbyi:hover,\n  .cv-settings-bottom-right.svelte-11erbyi:hover,\n  .cv-settings-top-left.svelte-11erbyi:hover,\n  .cv-settings-middle-left.svelte-11erbyi:hover,\n  .cv-settings-bottom-left.svelte-11erbyi:hover {width:55px;}.cv-pulse {\n    animation: svelte-11erbyi-pulse 2s infinite;}\n\n  @keyframes svelte-11erbyi-pulse {\n    0% {\n      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 0 rgba(62, 132, 244, 0.7);\n    }\n    70% {\n      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 10px rgba(62, 132, 244, 0);\n    }\n    100% {\n      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 0 rgba(62, 132, 244, 0);\n    }\n  }\n\n  @media (max-width: 768px) {.cv-settings-top-right.svelte-11erbyi,\n    .cv-settings-top-left.svelte-11erbyi {top:10px;}.cv-settings-bottom-right.svelte-11erbyi,\n    .cv-settings-bottom-left.svelte-11erbyi {bottom:10px;}.cv-settings-top-right.svelte-11erbyi,\n    .cv-settings-bottom-right.svelte-11erbyi,\n    .cv-settings-middle-right.svelte-11erbyi {right:0;}.cv-settings-top-left.svelte-11erbyi,\n    .cv-settings-bottom-left.svelte-11erbyi,\n    .cv-settings-middle-left.svelte-11erbyi {left:0;}.cv-settings-icon.svelte-11erbyi {width:60px;height:32px;}.cv-settings-icon.svelte-11erbyi:hover {width:75px;}\n  }\n\n  @media print {.cv-settings-icon.svelte-11erbyi {display:none !important;}\n  }'
	};

	function SettingsIcon($$anchor, $$props) {
		push($$props, true);
		append_styles$1($$anchor, $$css$9);

		let position = prop($$props, 'position', 3, 'middle-left'),
			title = prop($$props, 'title', 3, 'Customize View'),
			pulse = prop($$props, 'pulse', 3, false),
			onclick = prop($$props, 'onclick', 3, undefined),
			iconColor = prop($$props, 'iconColor', 3, undefined),
			backgroundColor = prop($$props, 'backgroundColor', 3, undefined),
			opacity = prop($$props, 'opacity', 3, undefined),
			scale = prop($$props, 'scale', 3, undefined);

		// Constants
		const STORAGE_KEY = 'cv-settings-icon-offset';

		const VIEWPORT_MARGIN = 10;
		const DRAG_THRESHOLD = 5;
		let isDragging = state(false);
		let dragStartY = 0;
		let dragStartOffset = 0;
		let currentOffset = state(0);
		let suppressClick = false;
		let minOffset = -Infinity;
		let maxOffset = Infinity;
		let settingsIconElement;

		onMount(() => {
			// Load persisted offset
			const saved = localStorage.getItem(STORAGE_KEY);

			if (saved) {
				set(currentOffset, parseFloat(saved), true);
			}

			// Global event listeners to handle drag leaving the element
			window.addEventListener('mousemove', handleDragMove);

			window.addEventListener('mouseup', endDrag);
			window.addEventListener('touchmove', handleDragMove, { passive: false });
			window.addEventListener('touchend', endDrag);
			window.addEventListener('resize', constrainPositionToViewport);

			// Initial check
			constCheckTimer = setTimeout(constrainPositionToViewport, 0); // Ensure layout is ready

			return () => {
				window.removeEventListener('mousemove', handleDragMove);
				window.removeEventListener('mouseup', endDrag);
				window.removeEventListener('touchmove', handleDragMove);
				window.removeEventListener('touchend', endDrag);
				window.removeEventListener('resize', constrainPositionToViewport);
				clearTimeout(constCheckTimer);
			};
		});

		let constCheckTimer;

		function resetPosition() {
			set(currentOffset, 0);
			dragStartOffset = 0;
			localStorage.removeItem(STORAGE_KEY);
		}

		function constrainPositionToViewport() {
			if (!settingsIconElement) return;

			const rect = settingsIconElement.getBoundingClientRect();

			// Calculate "zero" position (where element would be if offset was 0)
			const zeroTop = rect.top - get(currentOffset);

			const elementHeight = rect.height;
			const min = VIEWPORT_MARGIN - zeroTop;
			const max = window.innerHeight - VIEWPORT_MARGIN - zeroTop - elementHeight;

			// Clamp
			const clamped = Math.max(min, Math.min(max, get(currentOffset)));

			if (clamped !== get(currentOffset)) {
				set(currentOffset, clamped, true);
				savePosition();
			}
		}

		function onMouseDown(e) {
			if (e.button !== 0) return;

			startDrag(e.clientY);
		}

		function onTouchStart(e) {
			if (e.touches.length !== 1) return;

			startDrag(e.touches[0].clientY);
		}

		function startDrag(clientY) {
			set(isDragging, true);
			dragStartY = clientY;
			dragStartOffset = get(currentOffset);
			suppressClick = false;
			calculateDragConstraints();
		}

		function calculateDragConstraints() {
			if (!settingsIconElement) return;

			const rect = settingsIconElement.getBoundingClientRect();
			const zeroTop = rect.top - get(currentOffset);
			const elementHeight = rect.height;

			// We want the element to stay within [VIEWPORT_MARGIN, window.innerHeight - VIEWPORT_MARGIN]
			minOffset = VIEWPORT_MARGIN - zeroTop;

			maxOffset = window.innerHeight - VIEWPORT_MARGIN - zeroTop - elementHeight;
		}

		function handleDragMove(e) {
			if (!get(isDragging)) return;

			const clientY = getClientY(e);

			if (clientY === null) return;

			const deltaY = clientY - dragStartY;
			const rawOffset = dragStartOffset + deltaY;

			// Clamp the offset to keep element on screen
			set(currentOffset, Math.max(minOffset, Math.min(maxOffset, rawOffset)), true);

			if (Math.abs(deltaY) > DRAG_THRESHOLD) {
				suppressClick = true;
			}
		}

		function getClientY(e) {
			if (window.TouchEvent && e instanceof TouchEvent && e.touches.length > 0) {
				return e.touches[0].clientY;
			} else if (e instanceof MouseEvent) {
				return e.clientY;
			}

			return null;
		}

		function endDrag() {
			if (!get(isDragging)) return;

			set(isDragging, false);
			savePosition();
		}

		function savePosition() {
			localStorage.setItem(STORAGE_KEY, get(currentOffset).toString());
		}

		function onClick(e) {
			if (suppressClick) {
				e.stopImmediatePropagation();
				e.preventDefault();
				suppressClick = false;

				return;
			}

			if (onclick()) onclick()();
		}

		// Key handler for accessibility
		function onKeyDown(e) {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();

				if (onclick()) onclick()();
			}
		}

		// Helper for transforms
		function getTransform(pos, offset, s) {
			const isMiddle = pos && pos.includes('middle');
			let t = '';

			if (isMiddle) {
				t = `translateY(calc(-50% + ${offset}px))`;
			} else {
				t = `translateY(${offset}px)`;
			}

			if (s && s !== 1) {
				t += ` scale(${s})`;
			}

			return t;
		}

		var $$exports = { resetPosition };
		var div = root$6();

		div.__mousedown = onMouseDown;
		div.__touchstart = onTouchStart;
		div.__click = onClick;
		div.__keydown = onKeyDown;

		let styles;

		bind_this(div, ($$value) => settingsIconElement = $$value, () => settingsIconElement);

		template_effect(
			($0) => {
				set_class(div, 1, `cv-settings-icon cv-settings-${position() ?? ''} ${pulse() ? 'cv-pulse' : ''}`, 'svelte-11erbyi');
				set_attribute(div, 'title', title());
				styles = set_style(div, '', styles, $0);
			},
			[
				() => ({
					'--cv-icon-color': iconColor(),
					'--cv-icon-bg': backgroundColor(),
					'--cv-icon-opacity': opacity(),
					transform: getTransform(position(), get(currentOffset), scale()),
					cursor: get(isDragging) ? 'grabbing' : 'grab'
				})
			]
		);

		append($$anchor, div);

		return pop($$exports);
	}

	delegate(['mousedown', 'touchstart', 'click', 'keydown']);

	/** @import { BlurParams, CrossfadeParams, DrawParams, FadeParams, FlyParams, ScaleParams, SlideParams, TransitionConfig } from './public' */


	/** @param {number} x */
	const linear = (x) => x;

	/** @param {number} t */
	function cubic_out(t) {
		const f = t - 1.0;
		return f * f * f + 1.0;
	}

	/** @param {number | string} value
	 * @returns {[number, string]}
	 */
	function split_css_unit(value) {
		const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
		return split ? [parseFloat(split[1]), split[2] || 'px'] : [/** @type {number} */ (value), 'px'];
	}

	/**
	 * Animates the opacity of an element from 0 to the current opacity for `in` transitions and from the current opacity to 0 for `out` transitions.
	 *
	 * @param {Element} node
	 * @param {FadeParams} [params]
	 * @returns {TransitionConfig}
	 */
	function fade(node, { delay = 0, duration = 400, easing = linear } = {}) {
		const o = +getComputedStyle(node).opacity;
		return {
			delay,
			duration,
			easing,
			css: (t) => `opacity: ${t * o}`
		};
	}

	/**
	 * Animates the x and y positions and the opacity of an element. `in` transitions animate from the provided values, passed as parameters to the element's default values. `out` transitions animate from the element's default values to the provided values.
	 *
	 * @param {Element} node
	 * @param {FlyParams} [params]
	 * @returns {TransitionConfig}
	 */
	function fly(
		node,
		{ delay = 0, duration = 400, easing = cubic_out, x = 0, y = 0, opacity = 0 } = {}
	) {
		const style = getComputedStyle(node);
		const target_opacity = +style.opacity;
		const transform = style.transform === 'none' ? '' : style.transform;
		const od = target_opacity * (1 - opacity);
		const [x_value, x_unit] = split_css_unit(x);
		const [y_value, y_unit] = split_css_unit(y);
		return {
			delay,
			duration,
			easing,
			css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x_value}${x_unit}, ${(1 - t) * y_value}${y_unit});
			opacity: ${target_opacity - od * u}`
		};
	}

	/**
	 * Slides an element in and out.
	 *
	 * @param {Element} node
	 * @param {SlideParams} [params]
	 * @returns {TransitionConfig}
	 */
	function slide(node, { delay = 0, duration = 400, easing = cubic_out, axis = 'y' } = {}) {
		const style = getComputedStyle(node);

		const opacity = +style.opacity;
		const primary_property = axis === 'y' ? 'height' : 'width';
		const primary_property_value = parseFloat(style[primary_property]);
		const secondary_properties = axis === 'y' ? ['top', 'bottom'] : ['left', 'right'];
		const capitalized_secondary_properties = secondary_properties.map(
			(e) => /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */ (`${e[0].toUpperCase()}${e.slice(1)}`)
		);
		const padding_start_value = parseFloat(style[`padding${capitalized_secondary_properties[0]}`]);
		const padding_end_value = parseFloat(style[`padding${capitalized_secondary_properties[1]}`]);
		const margin_start_value = parseFloat(style[`margin${capitalized_secondary_properties[0]}`]);
		const margin_end_value = parseFloat(style[`margin${capitalized_secondary_properties[1]}`]);
		const border_width_start_value = parseFloat(
			style[`border${capitalized_secondary_properties[0]}Width`]
		);
		const border_width_end_value = parseFloat(
			style[`border${capitalized_secondary_properties[1]}Width`]
		);
		return {
			delay,
			duration,
			easing,
			css: (t) =>
				'overflow: hidden;' +
				`opacity: ${Math.min(t * 20, 1) * opacity};` +
				`${primary_property}: ${t * primary_property_value}px;` +
				`padding-${secondary_properties[0]}: ${t * padding_start_value}px;` +
				`padding-${secondary_properties[1]}: ${t * padding_end_value}px;` +
				`margin-${secondary_properties[0]}: ${t * margin_start_value}px;` +
				`margin-${secondary_properties[1]}: ${t * margin_end_value}px;` +
				`border-${secondary_properties[0]}-width: ${t * border_width_start_value}px;` +
				`border-${secondary_properties[1]}-width: ${t * border_width_end_value}px;` +
				`min-${primary_property}: 0`
		};
	}

	/**
	 * Animates the opacity and scale of an element. `in` transitions animate from the provided values, passed as parameters, to an element's current (default) values. `out` transitions animate from an element's default values to the provided values.
	 *
	 * @param {Element} node
	 * @param {ScaleParams} [params]
	 * @returns {TransitionConfig}
	 */
	function scale(
		node,
		{ delay = 0, duration = 400, easing = cubic_out, start = 0, opacity = 0 } = {}
	) {
		const style = getComputedStyle(node);
		const target_opacity = +style.opacity;
		const transform = style.transform === 'none' ? '' : style.transform;
		const sd = 1 - start;
		const od = target_opacity * (1 - opacity);
		return {
			delay,
			duration,
			easing,
			css: (_t, u) => `
			transform: ${transform} scale(${1 - sd * u});
			opacity: ${target_opacity - od * u}
		`
		};
	}

	/* theme-store.svelte.ts generated by Svelte v5.46.1 */

	function isThemeMode(value) {
		return value === 'auto' || value === 'light' || value === 'dark';
	}

	class ThemeStore {
		#mode = state('light' // Default to light
		);

		get mode() {
			return get(this.#mode);
		}

		set mode(value) {
			set(this.#mode, value, true);
		}

		#systemIsDark = state(false);

		get systemIsDark() {
			return get(this.#systemIsDark);
		}

		set systemIsDark(value) {
			set(this.#systemIsDark, value, true);
		}

		constructor() {
			// Initialize system preference
			if (typeof window !== 'undefined') {
				const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

				this.systemIsDark = mediaQuery.matches;
			}
		}

		listen() {
			// Auto feature disabled for now
			/*
			if (typeof window === 'undefined') return () => {};
			
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			// Update initial state just in case
			this.systemIsDark = mediaQuery.matches;
			    
			const handler = (e: MediaQueryListEvent) => {
			  this.systemIsDark = e.matches;
			};
			    
			mediaQuery.addEventListener('change', handler);
			return () => mediaQuery.removeEventListener('change', handler);
			*/
			return () => {};
		}

		init() {
			if (typeof localStorage !== 'undefined') {
				const saved = localStorage.getItem('cv-theme-pref');

				if (isThemeMode(saved)) {
					this.mode = saved;
				}
			}
		}

		setMode(newMode) {
			this.mode = newMode;

			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('cv-theme-pref', newMode);
			}
		}

		#currentTheme = user_derived(() => {
			if (this.mode === 'auto') {
				return this.systemIsDark ? 'dark' : 'light';
			}

			return this.mode;
		});

		get currentTheme() {
			return get(this.#currentTheme);
		}

		set currentTheme(value) {
			set(this.#currentTheme, value);
		}
	}

	const themeStore = new ThemeStore();

	var root_1$7 = from_html(`<p class="description svelte-dp7a9f"> </p>`);
	var root$5 = from_html(`<div class="card svelte-dp7a9f"><div class="content svelte-dp7a9f"><div><p class="title svelte-dp7a9f"> </p> <!></div> <div class="radios svelte-dp7a9f"><label class="radio-label svelte-dp7a9f" title="Hide"><input class="toggle-input svelte-dp7a9f" type="radio"/> <span>Hide</span></label> <label class="radio-label svelte-dp7a9f" title="Peek"><input class="toggle-input svelte-dp7a9f" type="radio"/> <span>Peek</span></label> <label class="radio-label svelte-dp7a9f" title="Show"><input class="toggle-input svelte-dp7a9f" type="radio"/> <span>Show</span></label></div></div></div>`);

	const $$css$8 = {
		hash: 'svelte-dp7a9f',
		code: '.card.svelte-dp7a9f {background:var(--cv-bg);border:1px solid var(--cv-border);border-radius:0.5rem;}.content.svelte-dp7a9f {display:flex;align-items:center;justify-content:space-between;padding:0.75rem;}.title.svelte-dp7a9f {font-weight:500;font-size:0.875rem;color:var(--cv-text);margin:0;}.description.svelte-dp7a9f {font-size:0.75rem;color:var(--cv-text-secondary);margin:0.125rem 0 0 0;}.radios.svelte-dp7a9f {display:flex;gap:8px;}.radio-label.svelte-dp7a9f {display:flex;align-items:center;gap:4px;font-size:0.85rem;cursor:pointer;color:var(--cv-text);}.toggle-input.svelte-dp7a9f {margin:0;opacity:1;width:auto;height:auto;}'
	};

	function ToggleItem($$anchor, $$props) {
		push($$props, true);
		append_styles$1($$anchor, $$css$8);

		const binding_group = [];

		let value = prop($$props, 'value', 15, 'show'),
			onchange = prop($$props, 'onchange', 3, () => {});

		var div = root$5();
		var div_1 = child(div);
		var div_2 = child(div_1);
		var p = child(div_2);
		var text = child(p, true);

		reset(p);

		var node = sibling(p, 2);

		{
			var consequent = ($$anchor) => {
				var p_1 = root_1$7();
				var text_1 = child(p_1, true);

				reset(p_1);
				template_effect(() => set_text(text_1, $$props.toggle.description));
				append($$anchor, p_1);
			};

			if_block(node, ($$render) => {
				if ($$props.toggle.description) $$render(consequent);
			});
		}

		reset(div_2);

		var div_3 = sibling(div_2, 2);
		var label = child(div_3);
		var input = child(label);

		remove_input_defaults(input);
		input.__change = () => onchange()({ toggleId: $$props.toggle.toggleId, value: 'hide' });
		input.value = input.__value = 'hide';
		next(2);
		reset(label);

		var label_1 = sibling(label, 2);
		var input_1 = child(label_1);

		remove_input_defaults(input_1);
		input_1.__change = () => onchange()({ toggleId: $$props.toggle.toggleId, value: 'peek' });
		input_1.value = input_1.__value = 'peek';
		next(2);
		reset(label_1);

		var label_2 = sibling(label_1, 2);
		var input_2 = child(label_2);

		remove_input_defaults(input_2);
		input_2.__change = () => onchange()({ toggleId: $$props.toggle.toggleId, value: 'show' });
		input_2.value = input_2.__value = 'show';
		next(2);
		reset(label_2);
		reset(div_3);
		reset(div_1);
		reset(div);

		template_effect(() => {
			set_text(text, $$props.toggle.label || $$props.toggle.toggleId);
			set_attribute(input, 'name', `cv-toggle-${$$props.toggle.toggleId ?? ''}`);
			set_attribute(input_1, 'name', `cv-toggle-${$$props.toggle.toggleId ?? ''}`);
			set_attribute(input_2, 'name', `cv-toggle-${$$props.toggle.toggleId ?? ''}`);
		});

		bind_group(binding_group, [], input, value, value);
		bind_group(binding_group, [], input_1, value, value);
		bind_group(binding_group, [], input_2, value, value);
		append($$anchor, div);
		pop();
	}

	delegate(['change']);

	var root_1$6 = from_html(`<p class="description svelte-741mad"> </p>`);
	var root_2$2 = from_html(`<option> </option>`);
	var root$4 = from_html(`<div class="root svelte-741mad"><div class="header svelte-741mad"><label class="label svelte-741mad"> </label> <!></div> <select class="select svelte-741mad"></select></div>`);

	const $$css$7 = {
		hash: 'svelte-741mad',
		code: '.root.svelte-741mad {display:flex;flex-direction:column;gap:0.75rem;padding:0.75rem;background:var(--cv-bg);border:1px solid var(--cv-border);border-radius:0.5rem;}\n\n  /* Remove special handling for last child since they are now separate cards */.root.svelte-741mad:last-child {border-bottom:1px solid var(--cv-border);}.header.svelte-741mad {display:flex;flex-direction:column;gap:0.25rem;}.label.svelte-741mad {font-size:0.875rem;color:var(--cv-text);margin:0;line-height:1.4;font-weight:500;display:block;cursor:pointer;}.description.svelte-741mad {font-size:0.75rem;color:var(--cv-text-secondary);margin:0;line-height:1.4;}.select.svelte-741mad {width:100%;border-radius:0.5rem;background:var(--cv-input-bg);border:1px solid var(--cv-input-border);color:var(--cv-text);padding:0.5rem 0.75rem;font-size:0.875rem;cursor:pointer;transition:all 0.15s ease;font-family:inherit;}.select.svelte-741mad:hover {border-color:var(--cv-text-secondary);}.select.svelte-741mad:focus {outline:none;border-color:var(--cv-primary);box-shadow:0 0 0 2px var(--cv-focus-ring);}'
	};

	function TabGroupItem($$anchor, $$props) {
		push($$props, true);
		append_styles$1($$anchor, $$css$7);

		let activeTabId = prop($$props, 'activeTabId', 15, ''),
			onchange = prop($$props, 'onchange', 3, () => {});

		function onChange(event) {
			const target = event.target;

			activeTabId(target.value);
			onchange()({ groupId: $$props.group.groupId, tabId: activeTabId() });
		}

		var div = root$4();
		var div_1 = child(div);
		var label = child(div_1);
		var text = child(label, true);

		reset(label);

		var node = sibling(label, 2);

		{
			var consequent = ($$anchor) => {
				var p = root_1$6();
				var text_1 = child(p, true);

				reset(p);
				template_effect(() => set_text(text_1, $$props.group.description));
				append($$anchor, p);
			};

			if_block(node, ($$render) => {
				if ($$props.group.description) $$render(consequent);
			});
		}

		reset(div_1);

		var select = sibling(div_1, 2);

		select.__change = onChange;

		each(select, 21, () => $$props.group.tabs, index, ($$anchor, tab) => {
			var option = root_2$2();
			var text_2 = child(option, true);

			reset(option);

			var option_value = {};

			template_effect(() => {
				set_text(text_2, get(tab).label || get(tab).tabId);

				if (option_value !== (option_value = get(tab).tabId)) {
					option.value = (option.__value = get(tab).tabId) ?? '';
				}
			});

			append($$anchor, option);
		});

		reset(select);

		var select_value;

		init_select(select);
		reset(div);

		template_effect(() => {
			set_attribute(label, 'for', `tab-group-${$$props.group.groupId ?? ''}`);
			set_text(text, $$props.group.label || $$props.group.groupId);
			set_attribute(select, 'id', `tab-group-${$$props.group.groupId ?? ''}`);

			if (select_value !== (select_value = activeTabId())) {
				(
					select.value = (select.__value = activeTabId()) ?? '',
					select_option(select, activeTabId())
				);
			}
		});

		append($$anchor, div);
		pop();
	}

	delegate(['change']);

	var root_2$1 = from_html(`<p class="description svelte-1tduk3b"> </p>`);
	var root_3$1 = from_html(`<div class="section svelte-1tduk3b"><div class="section-heading svelte-1tduk3b">Toggles</div> <div class="toggles-container svelte-1tduk3b"></div></div>`);
	var root_6 = from_html(`<div class="variable-item svelte-1tduk3b"><label class="variable-label svelte-1tduk3b"> </label> <input class="variable-input svelte-1tduk3b" type="text"/></div>`);
	var root_5 = from_html(`<div class="section svelte-1tduk3b"><div class="section-heading svelte-1tduk3b">Variables</div> <div class="variables-container svelte-1tduk3b"></div></div>`);
	var root_7 = from_html(`<div class="section svelte-1tduk3b"><div class="section-heading svelte-1tduk3b">Tab Groups</div> <div class="tabgroups-container svelte-1tduk3b"><div class="tabgroup-card header-card svelte-1tduk3b" role="group"><div class="tabgroup-row svelte-1tduk3b"><div class="logo-box svelte-1tduk3b" id="cv-nav-icon-box"><div class="nav-icon svelte-1tduk3b"><!></div></div> <div class="tabgroup-info svelte-1tduk3b"><div class="tabgroup-title-container"><p class="tabgroup-title svelte-1tduk3b">Show only the selected tab</p></div> <p class="tabgroup-description svelte-1tduk3b">Hide the navigation headers</p></div> <label class="toggle-switch nav-toggle svelte-1tduk3b"><input class="nav-pref-input svelte-1tduk3b" type="checkbox" aria-label="Show only the selected tab"/> <span class="switch-bg svelte-1tduk3b"></span> <span class="switch-knob svelte-1tduk3b"></span></label></div></div> <div class="tab-groups-list svelte-1tduk3b"></div></div></div>`);
	var root_1$5 = from_html(`<div class="tab-content active svelte-1tduk3b"><!> <!> <!> <!> <!></div>`);
	var root_10 = from_html(`<div class="tab-content active svelte-1tduk3b"><div class="share-content svelte-1tduk3b"><div class="share-instruction svelte-1tduk3b">Create a shareable link for your current customization, or select specific parts of the page to share.</div> <button class="share-action-btn primary start-share-btn svelte-1tduk3b"><span class="btn-icon svelte-1tduk3b"><!></span> <span>Select elements to share</span></button> <button class="share-action-btn copy-url-btn svelte-1tduk3b"><span class="btn-icon svelte-1tduk3b"><!></span> <span><!></span></button></div></div>`);
	var root_15 = from_html(`<button class="reset-btn svelte-1tduk3b" title="Reset to Default"><span><!></span> <span>Reset</span></button>`);
	var root_16 = from_html(`<div></div>`);
	var root$3 = from_html(`<div class="modal-overlay svelte-1tduk3b" role="presentation"><div class="modal-box cv-custom-state-modal svelte-1tduk3b" role="dialog" aria-modal="true"><header class="header svelte-1tduk3b"><div class="header-content svelte-1tduk3b"><div class="modal-icon svelte-1tduk3b"><!></div> <div class="title svelte-1tduk3b"> </div></div> <button class="close-btn svelte-1tduk3b" aria-label="Close modal"><!></button></header> <main class="main svelte-1tduk3b"><div class="tabs svelte-1tduk3b"><button>Customize</button> <button>Share</button></div> <!></main> <footer class="footer svelte-1tduk3b"><!> <a href="https://github.com/customviews-js/customviews" target="_blank" class="footer-link svelte-1tduk3b"><!> <span>View on GitHub</span></a> <button class="done-btn svelte-1tduk3b">Done</button></footer></div></div>`);

	const $$css$6 = {
		hash: 'svelte-1tduk3b',
		code: '\n/* \n  Styles from widget.ts/widget-styles.ts \n  Adapted for Svelte\n*/\n\n/* Modal Overlay & Modal Frame */.modal-overlay.svelte-1tduk3b {position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0, 0, 0, 0.5);display:flex;align-items:center;justify-content:center;z-index:10002;}.modal-box.svelte-1tduk3b {background:var(--cv-bg);border-radius:0.75rem;box-shadow:0 25px 50px -12px var(--cv-shadow);max-width:32rem;width:90vw;max-height:80vh;display:flex;flex-direction:column;}.header.svelte-1tduk3b {display:flex;align-items:center;justify-content:space-between;padding:0.5rem 1rem;border-bottom:1px solid var(--cv-border);}.header-content.svelte-1tduk3b {display:flex;align-items:center;gap:0.75rem;}.modal-icon.svelte-1tduk3b {position:relative;width:1rem;height:1rem;display:flex;align-items:center;justify-content:center;border-radius:9999px;color:var(--cv-text);}.modal-icon.svelte-1tduk3b svg {fill:currentColor;}.title.svelte-1tduk3b {font-size:1.125rem;font-weight:bold;color:var(--cv-text);margin:0;}.close-btn.svelte-1tduk3b {width:2rem;height:2rem;display:flex;align-items:center;justify-content:center;border-radius:9999px;background:transparent;border:none;color:var(--cv-text-secondary);cursor:pointer;transition:all 0.2s ease;}.close-btn.svelte-1tduk3b:hover {background:rgba(62, 132, 244, 0.1);color:var(--cv-primary);}.main.svelte-1tduk3b {padding:1rem;flex:1;display:flex;flex-direction:column;overflow-y:auto;max-height:calc(80vh - 8rem);}.description.svelte-1tduk3b {font-size:0.875rem;color:var(--cv-text);margin:0 0 1rem 0;line-height:1.4;}\n\n/* Tabs */.tabs.svelte-1tduk3b {display:flex;margin-bottom:1rem;border-bottom:2px solid var(--cv-border);}.tab.svelte-1tduk3b {background:transparent;border:none;padding:0.5rem 1rem;font-size:0.9rem;font-weight:600;color:var(--cv-text-secondary);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;}.tab.active.svelte-1tduk3b {color:var(--cv-primary);border-bottom-color:var(--cv-primary);}.tab-content.svelte-1tduk3b {display:none;}.tab-content.active.svelte-1tduk3b {display:block;}\n\n/* Section Styling */.section.svelte-1tduk3b {display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1.5rem;}.section-heading.svelte-1tduk3b {font-size:1rem;font-weight:bold;color:var(--cv-text);margin:0;}.toggles-container.svelte-1tduk3b {display:flex;flex-direction:column;gap:0.5rem;overflow:hidden;}\n\n/* Theme Selector */.theme-selector.svelte-1tduk3b {display:flex;background:var(--cv-input-bg);border:1px solid var(--cv-input-border);border-radius:0.5rem;padding:0.25rem;gap:0.25rem;}.theme-btn.svelte-1tduk3b {flex:1;display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:0.5rem;border:none;background:transparent;color:var(--cv-text-secondary);border-radius:0.375rem;cursor:pointer;font-size:0.875rem;font-weight:500;transition:all 0.2s ease;}.theme-btn.svelte-1tduk3b:hover {background:var(--cv-bg-hover);color:var(--cv-text);}.theme-btn.active.svelte-1tduk3b {background:var(--cv-primary);color:white;box-shadow:var(--cv-shadow-sm);}\n\n/* Tab Groups Section specific */.tabgroups-container.svelte-1tduk3b {border-radius:0.5rem;}\n\n/* Nav Toggle Card */.tabgroup-card.svelte-1tduk3b {background:var(--cv-bg);border-bottom:1px solid var(--cv-border);}.tabgroup-card.header-card.svelte-1tduk3b {display:flex;align-items:center;justify-content:space-between;padding:0.75rem;border:1px solid var(--cv-border);border-radius:0.5rem;margin-bottom:0.75rem;}.tabgroup-row.svelte-1tduk3b {display:flex;align-items:center;justify-content:space-between;width:100%;gap:1rem;}.logo-box.svelte-1tduk3b {width:3rem;height:3rem;background:var(--cv-modal-icon-bg);border-radius:0.5rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;}.nav-icon.svelte-1tduk3b {width:2rem;height:2rem;color:var(--cv-text);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:color 0.2s ease;}.tabgroup-info.svelte-1tduk3b {flex:1;display:flex;flex-direction:column;gap:0.25rem;}.tabgroup-title.svelte-1tduk3b {font-weight:500;font-size:0.875rem;color:var(--cv-text);margin:0 0 0 0;}.tabgroup-description.svelte-1tduk3b {font-size:0.75rem;color:var(--cv-text-secondary);margin:0;line-height:1.3;}\n\n/* Toggle Switch */.toggle-switch.svelte-1tduk3b {position:relative;display:inline-flex;align-items:center;width:44px;height:24px;background:var(--cv-switch-bg);border-radius:9999px;padding:2px;box-sizing:border-box;cursor:pointer;transition:background-color 0.2s ease;border:none;}.toggle-switch.svelte-1tduk3b input:where(.svelte-1tduk3b) {display:none;}.toggle-switch.svelte-1tduk3b .switch-bg:where(.svelte-1tduk3b) {position:absolute;inset:0;border-radius:9999px;background:var(--cv-switch-bg);transition:background-color 0.2s ease;pointer-events:none;}.toggle-switch.svelte-1tduk3b .switch-knob:where(.svelte-1tduk3b) {position:relative;width:20px;height:20px;background:var(--cv-switch-knob);border-radius:50%;box-shadow:0 1px 2px rgba(0, 0, 0, 0.1);transition:transform 0.2s ease;transform:translateX(0);}.toggle-switch.svelte-1tduk3b input:where(.svelte-1tduk3b):checked ~ .switch-knob:where(.svelte-1tduk3b) {transform:translateX(20px);}.toggle-switch.svelte-1tduk3b input:where(.svelte-1tduk3b):checked ~ .switch-bg:where(.svelte-1tduk3b) {background:var(--cv-primary);}\n\n/* Tab Groups List */.tab-groups-list.svelte-1tduk3b {display:flex;flex-direction:column;gap:0.75rem;}\n\n/* Footer */.footer.svelte-1tduk3b {padding:1rem;border-top:1px solid var(--cv-border);display:flex;align-items:center;justify-content:space-between;background:var(--cv-bg);border-bottom-left-radius:0.75rem;border-bottom-right-radius:0.75rem;}.footer-link.svelte-1tduk3b {display:flex;align-items:center;gap:0.5rem;color:var(--cv-text-secondary);text-decoration:none;font-size:0.875rem;font-weight:500;transition:color 0.15s ease;}.footer-link.svelte-1tduk3b:hover {color:var(--cv-text);}.reset-btn.svelte-1tduk3b {display:flex;align-items:center;gap:0.5rem;background:var(--cv-bg);border:1px solid var(--cv-border);font-size:0.875rem;font-weight:500;color:var(--cv-danger);cursor:pointer;padding:0.5rem 0.75rem;border-radius:0.5rem;transition:all 0.2s ease;box-shadow:0 1px 2px rgba(0, 0, 0, 0.05);}.reset-btn.svelte-1tduk3b:hover {background:var(--cv-danger-bg);border-color:var(--cv-danger);box-shadow:0 2px 4px rgba(0, 0, 0, 0.05);}.done-btn.svelte-1tduk3b {background:var(--cv-primary);color:white;border:none;padding:0.5rem 1rem;border-radius:0.375rem;font-weight:600;font-size:0.875rem;cursor:pointer;transition:background-color 0.15s ease;}.done-btn.svelte-1tduk3b:hover {background:var(--cv-primary-hover);}.reset-btn-icon.svelte-1tduk3b {display:flex;align-items:center;width:1.25rem;height:1.25rem;}.spinning {\n  animation: svelte-1tduk3b-spin 1s linear infinite;}\n\n@keyframes svelte-1tduk3b-spin {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}\n\n/* Share Tab Styles */.share-content.svelte-1tduk3b {display:flex;flex-direction:column;gap:1rem;align-items:center;text-align:center;padding:1rem 0;}.share-instruction.svelte-1tduk3b {font-size:0.95rem;color:var(--cv-text-secondary);margin-bottom:0.5rem;}.share-action-btn.svelte-1tduk3b {display:flex;align-items:center;justify-content:center;gap:0.75rem;width:100%;max-width:320px;padding:0.75rem 1rem;border-radius:0.5rem;font-weight:500;font-size:0.95rem;cursor:pointer;transition:all 0.2s ease;border:1px solid var(--cv-border);background:var(--cv-bg);color:var(--cv-text);}.share-action-btn.svelte-1tduk3b:hover {border-color:var(--cv-primary);color:var(--cv-primary);background:var(--cv-bg-hover);}.share-action-btn.primary.svelte-1tduk3b {background:var(--cv-primary);border-color:var(--cv-primary);color:white;}.share-action-btn.primary.svelte-1tduk3b:hover {background:var(--cv-primary-hover);border-color:var(--cv-primary-hover);}.btn-icon.svelte-1tduk3b {display:flex;align-items:center;justify-content:center;width:1.25rem;height:1.25rem;}\n\n/* Variable Inputs */.variables-container.svelte-1tduk3b {display:flex;flex-direction:column;gap:0.75rem;}.variable-item.svelte-1tduk3b {display:flex;flex-direction:column;gap:0.25rem;}.variable-label.svelte-1tduk3b {font-size:0.85rem;font-weight:500;color:var(--cv-text);}.variable-input.svelte-1tduk3b {padding:0.5rem 0.75rem;border:1px solid var(--cv-input-border);border-radius:0.375rem;font-size:0.9rem;transition:border-color 0.2s;background:var(--cv-input-bg);color:var(--cv-text);}.variable-input.svelte-1tduk3b:focus {outline:none;border-color:var(--cv-primary);box-shadow:0 0 0 2px var(--cv-focus-ring);}'
	};

	function Modal($$anchor, $$props) {
		push($$props, true);
		append_styles$1($$anchor, $$css$6);

		let title = prop($$props, 'title', 3, 'Customize View'),
			description = prop($$props, 'description', 3, ''),
			showReset = prop($$props, 'showReset', 3, true),
			showTabGroups = prop($$props, 'showTabGroups', 3, true),
			toggles = prop($$props, 'toggles', 19, () => []),
			tabGroups = prop($$props, 'tabGroups', 19, () => []),
			shownToggles = prop($$props, 'shownToggles', 19, () => []),
			peekToggles = prop($$props, 'peekToggles', 19, () => []),
			activeTabs = prop($$props, 'activeTabs', 19, () => ({})),
			navsVisible = prop($$props, 'navsVisible', 3, true),
			isResetting = prop($$props, 'isResetting', 3, false),
			placeholderDefinitions = prop($$props, 'placeholderDefinitions', 19, () => []),
			placeholderValues = prop($$props, 'placeholderValues', 19, () => ({})),
			onclose = prop($$props, 'onclose', 3, () => {}),
			onreset = prop($$props, 'onreset', 3, () => {}),
			ontoggleChange = prop($$props, 'ontoggleChange', 3, () => {}),
			ontabGroupChange = prop($$props, 'ontabGroupChange', 3, () => {}),
			ontoggleNav = prop($$props, 'ontoggleNav', 3, () => {}),
			oncopyShareUrl = prop($$props, 'oncopyShareUrl', 3, () => {}),
			onstartShare = prop($$props, 'onstartShare', 3, () => {}),
			onvariableChange = prop($$props, 'onvariableChange', 3, () => {});

		let activeTab = state('customize');
		let copySuccess = state(false);
		let navIconHtml = state('');

		user_effect(() => {
			updateNavIcon(navsVisible(), false);
		});

		function updateNavIcon(isVisible, isHovering) {
			if (isHovering) {
				set(navIconHtml, getNavDashed(), true);
			} else {
				set(navIconHtml, isVisible ? getNavHeadingOnIcon() : getNavHeadingOffIcon(), true);
			}
		}

		function handleNavHover(hovering) {
			updateNavIcon(navsVisible(), hovering);
		}

		function handleNavToggle() {
			ontoggleNav()(!navsVisible());
		}

		function handleToggleChange(detail) {
			ontoggleChange()(detail);
		}

		function handleVariableInput(name, e) {
			const target = e.target;

			onvariableChange()({ name, value: target.value });
		}

		function handleTabGroupChange(detail) {
			ontabGroupChange()(detail);
		}

		function copyShareUrl() {
			oncopyShareUrl()();
			set(copySuccess, true);

			setTimeout(
				() => {
					set(copySuccess, false);
				},
				2000
			);
		}

		function computeToggleState(id, currentShown, currentPeek) {
			if (currentShown.includes(id)) return 'show';
			if (currentPeek.includes(id)) return 'peek';

			return 'hide';
		}

		var div = root$3();

		div.__click = (e) => {
			if (e.target === e.currentTarget) onclose()();
		};

		var div_1 = child(div);
		var header = child(div_1);
		var div_2 = child(header);
		var div_3 = child(div_2);
		var node = child(div_3);

		html(node, getGearIcon);
		reset(div_3);

		var div_4 = sibling(div_3, 2);
		var text$1 = child(div_4, true);

		reset(div_4);
		reset(div_2);

		var button = sibling(div_2, 2);

		button.__click = function (...$$args) {
			onclose()?.apply(this, $$args);
		};

		var node_1 = child(button);

		html(node_1, getCloseIcon);
		reset(button);
		reset(header);

		var main = sibling(header, 2);
		var div_5 = child(main);
		var button_1 = child(div_5);

		button_1.__click = () => set(activeTab, 'customize');

		var button_2 = sibling(button_1, 2);

		button_2.__click = () => set(activeTab, 'share');
		reset(div_5);

		var node_2 = sibling(div_5, 2);

		{
			var consequent_5 = ($$anchor) => {
				var div_6 = root_1$5();
				var node_3 = child(div_6);

				{
					var consequent = ($$anchor) => {
						var p = root_2$1();
						var text_1 = child(p, true);

						reset(p);
						template_effect(() => set_text(text_1, description()));
						append($$anchor, p);
					};

					if_block(node_3, ($$render) => {
						if (description()) $$render(consequent);
					});
				}

				var node_4 = sibling(node_3, 2);

				{
					var consequent_1 = ($$anchor) => {
						var div_7 = root_3$1();
						var div_8 = sibling(child(div_7), 2);

						each(div_8, 21, toggles, (toggle) => toggle.toggleId, ($$anchor, toggle) => {
							{
								let $0 = user_derived(() => computeToggleState(get(toggle).toggleId, shownToggles(), peekToggles()));

								ToggleItem($$anchor, {
									get toggle() {
										return get(toggle);
									},

									get value() {
										return get($0);
									},

									onchange: handleToggleChange
								});
							}
						});

						reset(div_8);
						reset(div_7);
						append($$anchor, div_7);
					};

					if_block(node_4, ($$render) => {
						if (toggles().length > 0) $$render(consequent_1);
					});
				}

				var node_5 = sibling(node_4, 2);

				{
					var consequent_2 = ($$anchor) => {
						var div_9 = root_5();
						var div_10 = sibling(child(div_9), 2);

						each(div_10, 21, placeholderDefinitions, (def) => def.name, ($$anchor, def) => {
							var div_11 = root_6();
							var label = child(div_11);
							var text_2 = child(label, true);

							reset(label);

							var input = sibling(label, 2);

							remove_input_defaults(input);
							input.__input = (e) => handleVariableInput(get(def).name, e);
							reset(div_11);

							template_effect(() => {
								set_attribute(label, 'for', `cv-var-${get(def).name ?? ''}`);
								set_text(text_2, get(def).settingsLabel || get(def).name);
								set_attribute(input, 'id', `cv-var-${get(def).name ?? ''}`);
								set_attribute(input, 'placeholder', get(def).settingsHint || '');
								set_value(input, placeholderValues()[get(def).name] ?? get(def).defaultValue ?? '');
							});

							append($$anchor, div_11);
						});

						reset(div_10);
						reset(div_9);
						append($$anchor, div_9);
					};

					if_block(node_5, ($$render) => {
						if (placeholderDefinitions().length > 0) $$render(consequent_2);
					});
				}

				var node_6 = sibling(node_5, 2);

				{
					var consequent_3 = ($$anchor) => {
						var div_12 = root_7();
						var div_13 = sibling(child(div_12), 2);
						var div_14 = child(div_13);
						var div_15 = child(div_14);
						var div_16 = child(div_15);
						var div_17 = child(div_16);
						var node_7 = child(div_17);

						html(node_7, () => get(navIconHtml));
						reset(div_17);
						reset(div_16);

						var label_1 = sibling(div_16, 4);
						var input_1 = child(label_1);

						remove_input_defaults(input_1);
						input_1.__change = handleNavToggle;
						next(4);
						reset(label_1);
						reset(div_15);
						reset(div_14);

						var div_18 = sibling(div_14, 2);

						each(div_18, 21, tabGroups, (group) => group.groupId, ($$anchor, group) => {
							{
								let $0 = user_derived(() => activeTabs()[get(group).groupId] || get(group).tabs[0]?.tabId);

								TabGroupItem($$anchor, {
									get group() {
										return get(group);
									},

									get activeTabId() {
										return get($0);
									},

									onchange: handleTabGroupChange
								});
							}
						});

						reset(div_18);
						reset(div_13);
						reset(div_12);
						template_effect(() => set_checked(input_1, !navsVisible()));
						event('mouseenter', div_14, () => handleNavHover(true));
						event('mouseleave', div_14, () => handleNavHover(false));
						append($$anchor, div_12);
					};

					if_block(node_6, ($$render) => {
						if (showTabGroups() && tabGroups().length > 0) $$render(consequent_3);
					});
				}

				var node_8 = sibling(node_6, 2);

				{

					if_block(node_8, ($$render) => {
					});
				}

				reset(div_6);
				transition(1, div_6, () => fade, () => ({ duration: 150 }));
				append($$anchor, div_6);
			};

			var alternate_2 = ($$anchor) => {
				var div_21 = root_10();
				var div_22 = child(div_21);
				var button_5 = sibling(child(div_22), 2);

				button_5.__click = function (...$$args) {
					onstartShare()?.apply(this, $$args);
				};

				var span = child(button_5);
				var node_11 = child(span);

				html(node_11, getShareIcon);
				reset(span);
				next(2);
				reset(button_5);

				var button_6 = sibling(button_5, 2);

				button_6.__click = copyShareUrl;

				var span_1 = child(button_6);
				var node_12 = child(span_1);

				{
					var consequent_6 = ($$anchor) => {
						var fragment_2 = comment();
						var node_13 = first_child(fragment_2);

						html(node_13, getTickIcon);
						append($$anchor, fragment_2);
					};

					var alternate = ($$anchor) => {
						var fragment_3 = comment();
						var node_14 = first_child(fragment_3);

						html(node_14, getCopyIcon);
						append($$anchor, fragment_3);
					};

					if_block(node_12, ($$render) => {
						if (get(copySuccess)) $$render(consequent_6); else $$render(alternate, false);
					});
				}

				reset(span_1);

				var span_2 = sibling(span_1, 2);
				var node_15 = child(span_2);

				{
					var consequent_7 = ($$anchor) => {
						var text_3 = text('Copied!');

						append($$anchor, text_3);
					};

					var alternate_1 = ($$anchor) => {
						var text_4 = text('Copy Shareable URL of Settings');

						append($$anchor, text_4);
					};

					if_block(node_15, ($$render) => {
						if (get(copySuccess)) $$render(consequent_7); else $$render(alternate_1, false);
					});
				}

				reset(span_2);
				reset(button_6);
				reset(div_22);
				reset(div_21);
				transition(1, div_21, () => fade, () => ({ duration: 150 }));
				append($$anchor, div_21);
			};

			if_block(node_2, ($$render) => {
				if (get(activeTab) === 'customize') $$render(consequent_5); else $$render(alternate_2, false);
			});
		}

		reset(main);

		var footer = sibling(main, 2);
		var node_16 = child(footer);

		{
			var consequent_8 = ($$anchor) => {
				var button_7 = root_15();

				button_7.__click = function (...$$args) {
					onreset()?.apply(this, $$args);
				};

				var span_3 = child(button_7);
				var node_17 = child(span_3);

				html(node_17, getResetIcon);
				reset(span_3);
				next(2);
				reset(button_7);
				template_effect(() => set_class(span_3, 1, `reset-btn-icon ${isResetting() ? 'spinning' : ''}`, 'svelte-1tduk3b'));
				append($$anchor, button_7);
			};

			var alternate_3 = ($$anchor) => {
				var div_23 = root_16();

				append($$anchor, div_23);
			};

			if_block(node_16, ($$render) => {
				if (showReset()) $$render(consequent_8); else $$render(alternate_3, false);
			});
		}

		var a = sibling(node_16, 2);
		var node_18 = child(a);

		html(node_18, getGitHubIcon);
		next(2);
		reset(a);

		var button_8 = sibling(a, 2);

		button_8.__click = function (...$$args) {
			onclose()?.apply(this, $$args);
		};

		reset(footer);
		reset(div_1);
		reset(div);

		template_effect(() => {
			set_text(text$1, title());
			set_class(button_1, 1, `tab ${get(activeTab) === 'customize' ? 'active' : ''}`, 'svelte-1tduk3b');
			set_class(button_2, 1, `tab ${get(activeTab) === 'share' ? 'active' : ''}`, 'svelte-1tduk3b');
		});

		transition(3, div_1, () => scale, () => ({ duration: 200, start: 0.9 }));
		transition(3, div, () => fade, () => ({ duration: 200 }));
		append($$anchor, div);
		pop();
	}

	delegate(['click', 'input', 'change']);

	/* share-store.svelte.ts generated by Svelte v5.46.1 */

	const SELECTED_CLASS = 'cv-share-selected';
	const HIGHLIGHT_TARGET_CLASS = 'cv-highlight-target';
	const HIDE_SELECTED_CLASS = 'cv-share-selected-hide';
	const HIDE_HIGHLIGHT_TARGET_CLASS = 'cv-highlight-target-hide';
	const HIGHLIGHT_SELECTED_CLASS = 'cv-share-selected-highlight';
	const HIGHLIGHT_TARGET_MODE_CLASS = 'cv-highlight-target-mode';
	const CV_CUSTOM_ELEMENTS = 'cv-tabgroup, cv-toggle';
	const SHAREABLE_SELECTOR = 'div, p, blockquote, pre, li, h1, h2, h3, h4, h5, h6, table, ' + CV_CUSTOM_ELEMENTS;
	const GENERIC_WRAPPER_IDS = ['flex-body', 'content-wrapper', 'app'];

	function isGenericWrapper(el) {
		// Check for explicit generic IDs (layout wrappers)
		if (el.id && GENERIC_WRAPPER_IDS.includes(el.id)) return true;

		if (el.tagName !== 'DIV') return false;
		if (el.id) return false;

		const style = window.getComputedStyle(el);
		const hasBackground = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent';
		const hasBorder = style.borderStyle !== 'none' && parseFloat(style.borderWidth) > 0;
		const hasShadow = style.boxShadow !== 'none';

		return !hasBackground && !hasBorder && !hasShadow;
	}

	class ShareStore {
		#isActive = state(false);

		get isActive() {
			return get(this.#isActive);
		}

		set isActive(value) {
			set(this.#isActive, value, true);
		}

		#selectionMode = state('focus');

		get selectionMode() {
			return get(this.#selectionMode);
		}

		set selectionMode(value) {
			set(this.#selectionMode, value, true);
		}

		#selectedElements = state(proxy(new SvelteSet()));

		get selectedElements() {
			return get(this.#selectedElements);
		}

		set selectedElements(value) {
			set(this.#selectedElements, value, true);
		}

		#currentHoverTarget = state(null);

		get currentHoverTarget() {
			return get(this.#currentHoverTarget);
		}

		set currentHoverTarget(value) {
			set(this.#currentHoverTarget, value, true);
		}

		#shareCount = user_derived(() => this.selectedElements.size);

		get shareCount() {
			return get(this.#shareCount);
		}

		set shareCount(value) {
			set(this.#shareCount, value);
		}

		toggleActive(active) {
			const newState = active !== undefined ? active : !this.isActive;

			if (!newState) {
				// Cleanup on deactivate
				this.clearAllSelections();

				if (this.currentHoverTarget) {
					this._removeHighlightClass(this.currentHoverTarget);
				}

				// Reset state
				this.isActive = false;

				this.currentHoverTarget = null;
				document.body.classList.remove('cv-share-active-focus', 'cv-share-active-hide', 'cv-share-active-highlight');
			} else {
				this.isActive = true;
				this.updateBodyClass();
			}
		}

		setSelectionMode(mode) {
			if (this.selectionMode === mode) return;

			this.selectionMode = mode;

			// Update styling for all currently selected elements
			this.selectedElements.forEach((el) => {
				this._removeSelectionClass(el);
				this._addSelectionClass(el);
			});

			if (this.isActive) {
				this.updateBodyClass();
			}
		}

		updateBodyClass() {
			document.body.classList.remove('cv-share-active-focus', 'cv-share-active-hide', 'cv-share-active-highlight');
			document.body.classList.add(`cv-share-active-${this.selectionMode}`);
		}

		setHoverTarget(target) {
			// Clear previous highlight
			if (this.currentHoverTarget && this.currentHoverTarget !== target) {
				this._removeHighlightClass(this.currentHoverTarget);
			}

			// Set new highlight
			if (target) {
				this._addHighlightClass(target);
			}

			this.currentHoverTarget = target;
		}

		toggleElementSelection(el) {
			if (this.selectedElements.has(el)) {
				this.selectedElements.delete(el);
				this._removeSelectionClass(el);
			} else {
				this.selectElement(el);
			}
		}

		selectElement(el) {
			if (this.selectedElements.has(el)) return;

			// 1. Check if ancestor is selected (Scenario B)
			let parent = el.parentElement;

			let ancestorSelected = false;

			while (parent) {
				if (this.selectedElements.has(parent)) {
					ancestorSelected = true;

					break;
				}

				parent = parent.parentElement;
			}

			if (ancestorSelected) {
				return; // Ignore
			}

			// 2. Remove children if selected (Scenario A)
			const toRemove = [];

			this.selectedElements.forEach((selected) => {
				if (el.contains(selected) && el !== selected) {
					toRemove.push(selected);
				}
			});

			toRemove.forEach((child) => {
				this.selectedElements.delete(child);
				this._removeSelectionClass(child);
			});

			// Add
			this.selectedElements.add(el);

			this._addSelectionClass(el);
		}

		addMultipleElements(elements) {
			for (const el of elements) {
				this.selectElement(el);
			}
		}

		clearAllSelections() {
			this.selectedElements.forEach((el) => this._removeSelectionClass(el));
			this.selectedElements.clear();
		}

		_addHighlightClass(el) {
			if (this.selectionMode === 'hide') {
				el.classList.add(HIDE_HIGHLIGHT_TARGET_CLASS);
			} else if (this.selectionMode === 'highlight') {
				el.classList.add(HIGHLIGHT_TARGET_MODE_CLASS);
			} else {
				el.classList.add(HIGHLIGHT_TARGET_CLASS);
			}
		}

		_removeHighlightClass(el) {
			el.classList.remove(HIGHLIGHT_TARGET_CLASS, HIDE_HIGHLIGHT_TARGET_CLASS, HIGHLIGHT_TARGET_MODE_CLASS);
		}

		_addSelectionClass(el) {
			if (this.selectionMode === 'hide') {
				el.classList.add(HIDE_SELECTED_CLASS);
			} else if (this.selectionMode === 'highlight') {
				el.classList.add(HIGHLIGHT_SELECTED_CLASS);
			} else {
				el.classList.add(SELECTED_CLASS);
			}
		}

		_removeSelectionClass(el) {
			el.classList.remove(SELECTED_CLASS, HIDE_SELECTED_CLASS, HIGHLIGHT_SELECTED_CLASS);
		}

		generateLink() {
			if (this.selectedElements.size === 0) {
				showToast('Please select at least one item.');

				return;
			}

			const descriptors = Array.from(this.selectedElements).map((el) => createDescriptor(el));
			let serialized;

			try {
				serialized = serialize(descriptors);
			} catch(e) {
				showToast('Failed to generate link. Please try selecting fewer items.');

				return;
			}

			const url = new URL(window.location.href);

			// Clear all potential params first
			url.searchParams.delete('cv-focus');

			url.searchParams.delete('cv-hide');
			url.searchParams.delete('cv-highlight');

			if (this.selectionMode === 'hide') {
				url.searchParams.set('cv-hide', serialized);
			} else if (this.selectionMode === 'highlight') {
				url.searchParams.set('cv-highlight', serialized);
			} else {
				url.searchParams.set('cv-focus', serialized);
			}

			// Copy to clipboard
			navigator.clipboard.writeText(url.href).then(() => {
				showToast('Link copied to clipboard!');
			}).catch(() => {
				showToast('Failed to copy to clipboard');
			});
		}

		previewLink() {
			if (this.selectedElements.size === 0) {
				showToast('Please select at least one item.');

				return;
			}

			const descriptors = Array.from(this.selectedElements).map((el) => createDescriptor(el));
			const serialized = serialize(descriptors);
			const url = new URL(window.location.href);

			url.searchParams.delete('cv-focus');
			url.searchParams.delete('cv-hide');
			url.searchParams.delete('cv-highlight');

			if (this.selectionMode === 'hide') {
				url.searchParams.set('cv-hide', serialized);
			} else if (this.selectionMode === 'highlight') {
				url.searchParams.set('cv-highlight', serialized);
			} else {
				url.searchParams.set('cv-focus', serialized);
			}

			window.open(url.toString(), '_blank');
		}
	}

	const shareStore = new ShareStore();

	/*
	Adapted from https://github.com/mattdesl
	Distributed under MIT License https://github.com/mattdesl/eases/blob/master/LICENSE.md
	*/


	/**
	 * @param {number} t
	 * @returns {number}
	 */
	function cubicOut(t) {
		const f = t - 1.0;
		return f * f * f + 1.0;
	}

	/** @import { FlipParams, AnimationConfig } from './public.js' */

	/**
	 * The flip function calculates the start and end position of an element and animates between them, translating the x and y values.
	 * `flip` stands for [First, Last, Invert, Play](https://aerotwist.com/blog/flip-your-animations/).
	 *
	 * @param {Element} node
	 * @param {{ from: DOMRect; to: DOMRect }} fromTo
	 * @param {FlipParams} params
	 * @returns {AnimationConfig}
	 */
	function flip(node, { from, to }, params = {}) {
		var { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;

		var style = getComputedStyle(node);

		// find the transform origin, expressed as a pair of values between 0 and 1
		var transform = style.transform === 'none' ? '' : style.transform;
		var [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
		ox /= node.clientWidth;
		oy /= node.clientHeight;

		// calculate effect of parent transforms and zoom
		var zoom = get_zoom(node); // https://drafts.csswg.org/css-viewport/#effective-zoom
		var sx = node.clientWidth / to.width / zoom;
		var sy = node.clientHeight / to.height / zoom;

		// find the starting position of the transform origin
		var fx = from.left + from.width * ox;
		var fy = from.top + from.height * oy;

		// find the ending position of the transform origin
		var tx = to.left + to.width * ox;
		var ty = to.top + to.height * oy;

		// find the translation at the start of the transform
		var dx = (fx - tx) * sx;
		var dy = (fy - ty) * sy;

		// find the relative scale at the start of the transform
		var dsx = from.width / to.width;
		var dsy = from.height / to.height;

		return {
			delay,
			duration: typeof duration === 'function' ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
			easing,
			css: (t, u) => {
				var x = u * dx;
				var y = u * dy;
				var sx = t + u * dsx;
				var sy = t + u * dsy;

				return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
			}
		};
	}

	/**
	 * @param {Element} element
	 */
	function get_zoom(element) {
		if ('currentCSSZoom' in element) {
			return /** @type {number} */ (element.currentCSSZoom);
		}

		/** @type {Element | null} */
		var current = element;
		var zoom = 1;

		while (current !== null) {
			zoom *= +getComputedStyle(current).zoom;
			current = /** @type {Element | null} */ (current.parentElement);
		}

		return zoom;
	}

	var root_1$4 = from_html(`<div role="alert" aria-live="polite"> </div>`);
	var root$2 = from_html(`<div class="toast-container svelte-8xfcdj"></div>`);

	const $$css$5 = {
		hash: 'svelte-8xfcdj',
		code: '.toast-container.svelte-8xfcdj {position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:20000;display:flex;flex-direction:column;align-items:center;gap:10px;pointer-events:none; /* Let clicks pass through container */}.toast-item.svelte-8xfcdj {background:rgba(0, 0, 0, 0.85);color:white;padding:10px 20px;border-radius:4px;font-size:14px;box-shadow:0 4px 6px rgba(0, 0, 0, 0.1);pointer-events:auto; /* Re-enable clicks on toasts */max-width:300px;text-align:center;}'
	};

	function Toast($$anchor, $$props) {
		push($$props, false);
		append_styles$1($$anchor, $$css$5);
		init$1();

		var // We can access the store directly in the template
		div = root$2();

		each(div, 13, () => toast.items, (t) => t.id, ($$anchor, t) => {
			var div_1 = root_1$4();
			var text = child(div_1, true);

			reset(div_1);

			template_effect(() => {
				set_class(div_1, 1, `${TOAST_CLASS} toast-item`, 'svelte-8xfcdj');
				set_text(text, get(t).message);
			});

			transition(1, div_1, () => fly, () => ({ y: -20, duration: 300 }));
			transition(2, div_1, () => fade, () => ({ duration: 200 }));
			animation(div_1, () => flip, null);
			append($$anchor, div_1);
		});

		reset(div);
		append($$anchor, div);
		pop();
	}

	create_custom_element(Toast, {}, [], [], true);

	var root$1 = from_html(`<div class="floating-bar svelte-s43aqa"><div class="mode-toggle svelte-s43aqa"><button title="Show only selected elements">Show</button> <button title="Hide selected elements">Hide</button> <button title="Highlight selected elements">Highlight</button></div> <span class="divider svelte-s43aqa"></span> <span class="count svelte-s43aqa"> </span> <button class="btn clear svelte-s43aqa">Clear</button> <button class="btn preview svelte-s43aqa">Preview</button> <button class="btn generate svelte-s43aqa">Copy Link</button> <button class="btn exit svelte-s43aqa">Exit</button></div>`);

	const $$css$4 = {
		hash: 'svelte-s43aqa',
		code: '.floating-bar.svelte-s43aqa {position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background-color:#2c2c2c;color:#f1f1f1;border-radius:8px;padding:8px 12px;box-shadow:0 8px 20px rgba(0, 0, 0, 0.4);display:grid;grid-template-columns:auto auto 1fr auto auto auto auto;align-items:center;gap:12px;z-index:99999;font-family:system-ui, -apple-system, sans-serif;font-size:14px;border:1px solid #4a4a4a;pointer-events:auto;white-space:nowrap;min-width:500px;}.mode-toggle.svelte-s43aqa {display:flex;background:#1a1a1a;border-radius:6px;padding:2px;border:1px solid #4a4a4a;}.mode-btn.svelte-s43aqa {background:transparent;color:#aeaeae;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-weight:500;font-size:13px;transition:all 0.2s;}.mode-btn.svelte-s43aqa:hover {color:#fff;}.mode-btn.active.svelte-s43aqa {background:#4a4a4a;color:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.2);}.divider.svelte-s43aqa {width:1px;height:20px;background:#4a4a4a;margin:0 4px;}.count.svelte-s43aqa {font-weight:500;min-width:120px;text-align:center;font-size:13px;color:#ccc;}.btn.svelte-s43aqa {background-color:#0078D4;color:white;border:none;padding:6px 12px;border-radius:5px;cursor:pointer;font-weight:500;transition:background-color 0.2s;font-size:13px;}.btn.svelte-s43aqa:hover {background-color:#005a9e;}.btn.clear.svelte-s43aqa {background-color:transparent;border:1px solid #5a5a5a;color:#dadada;}.btn.clear.svelte-s43aqa:hover {background-color:#3a3a3a;color:white;}.btn.preview.svelte-s43aqa {background-color:#333;border:1px solid #555;}.btn.preview.svelte-s43aqa:hover {background-color:#444;}.btn.exit.svelte-s43aqa {background-color:transparent;color:#ff6b6b;padding:6px 10px;}.btn.exit.svelte-s43aqa:hover {background-color:rgba(255, 107, 107, 0.1);}\n\n  @media (max-width: 600px) {.floating-bar.svelte-s43aqa {display:flex;flex-wrap:wrap;min-width:unset;width:90%;max-width:400px;height:auto;padding:12px;gap:10px;bottom:30px;}.mode-toggle.svelte-s43aqa {margin-right:auto;order:1;}.btn.exit.svelte-s43aqa {margin-left:auto;order:2;}.divider.svelte-s43aqa {display:none;}.count.svelte-s43aqa {width:100%;text-align:center;order:3;padding:8px 0;border-top:1px solid #3a3a3a;border-bottom:1px solid #3a3a3a;margin:4px 0;}.btn.clear.svelte-s43aqa, .btn.preview.svelte-s43aqa, .btn.generate.svelte-s43aqa {flex:1;text-align:center;font-size:12px;padding:8px 4px;order:4;}.btn.generate.svelte-s43aqa {flex:1.5;}\n  }'
	};

	function ShareToolbar($$anchor, $$props) {
		push($$props, false);
		append_styles$1($$anchor, $$css$4);

		function handleClear() {
			shareStore.clearAllSelections();
		}

		function handlePreview() {
			shareStore.previewLink();
		}

		function handleGenerate() {
			shareStore.generateLink();
		}

		function handleExit() {
			shareStore.toggleActive(false);
		}

		init$1();

		var div = root$1();
		var div_1 = child(div);
		var button = child(div_1);

		button.__click = () => shareStore.setSelectionMode('focus');

		var button_1 = sibling(button, 2);

		button_1.__click = () => shareStore.setSelectionMode('hide');

		var button_2 = sibling(button_1, 2);

		button_2.__click = () => shareStore.setSelectionMode('highlight');
		reset(div_1);

		var span = sibling(div_1, 4);
		var text = child(span);

		reset(span);

		var button_3 = sibling(span, 2);

		button_3.__click = handleClear;

		var button_4 = sibling(button_3, 2);

		button_4.__click = handlePreview;

		var button_5 = sibling(button_4, 2);

		button_5.__click = handleGenerate;

		var button_6 = sibling(button_5, 2);

		button_6.__click = handleExit;
		reset(div);

		template_effect(() => {
			set_class(button, 1, `mode-btn ${shareStore.selectionMode === 'focus' ? 'active' : ''}`, 'svelte-s43aqa');
			set_attribute(button, 'aria-pressed', shareStore.selectionMode === 'focus');
			set_class(button_1, 1, `mode-btn ${shareStore.selectionMode === 'hide' ? 'active' : ''}`, 'svelte-s43aqa');
			set_attribute(button_1, 'aria-pressed', shareStore.selectionMode === 'hide');
			set_class(button_2, 1, `mode-btn ${shareStore.selectionMode === 'highlight' ? 'active' : ''}`, 'svelte-s43aqa');
			set_attribute(button_2, 'aria-pressed', shareStore.selectionMode === 'highlight');

			set_text(text, `${shareStore.shareCount ?? ''} item${shareStore.shareCount === 1 ? '' : 's'} to ${shareStore.selectionMode === 'focus'
			? 'show'
			: shareStore.selectionMode === 'highlight' ? 'highlight' : 'hide'}`);
		});

		transition(3, div, () => fly, () => ({ y: 50, duration: 200 }));
		append($$anchor, div);
		pop();
	}

	delegate(['click']);

	var root_2 = from_html(`<span class="id-badge svelte-2rmv56" title="ID detection active"> </span>`);
	var root_3 = from_html(`<button class="action-btn up svelte-2rmv56" title="Select Parent">↰</button>`);
	var root_1$3 = from_html(`<div class="hover-helper svelte-2rmv56"><div class="info svelte-2rmv56"><span class="tag svelte-2rmv56"> </span> <!></div> <button> </button> <!></div>`);

	const $$css$3 = {
		hash: 'svelte-2rmv56',
		code: '.hover-helper.svelte-2rmv56 {position:fixed;z-index:99999;background-color:#333;color:white;padding:4px 8px;border-radius:4px;display:flex;align-items:center;gap:8px;box-shadow:0 2px 5px rgba(0,0,0,0.2);font-family:monospace;pointer-events:auto;}.info.svelte-2rmv56 {display:flex;flex-direction:column;align-items:flex-start;line-height:1;gap:2px;}.tag.svelte-2rmv56 {font-size:12px;font-weight:bold;color:#aeaeae;}.id-badge.svelte-2rmv56 {font-size:10px;color:#64d2ff;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.action-btn.svelte-2rmv56 {background:#555;border:none;color:white;border-radius:3px;cursor:pointer;padding:2px 6px;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;transition:background-color 0.1s;}.action-btn.svelte-2rmv56:hover {background:#777;}.action-btn.deselect.svelte-2rmv56 {background-color:#d13438;}.action-btn.deselect.svelte-2rmv56:hover {background-color:#a42628;}'
	};

	function HoverHelper($$anchor, $$props) {
		push($$props, true);
		append_styles$1($$anchor, $$css$3);

		// Derived state for easier access
		let target = user_derived(() => shareStore.currentHoverTarget);

		let isSelected = user_derived(() => get(target) && shareStore.selectedElements.has(get(target)));

		// Computed Position using effect for DOM layout properties
		let style = state('display: none;');

		let tagName = state('TAG');
		let elementId = state(null);
		let canGoUp = state(false);
		let lastSavedHelperPosition = state(null);

		function findNextShareableParent(el) {
			let parent = el.parentElement;

			while (parent) {
				if (parent.matches(SHAREABLE_SELECTOR) && !isGenericWrapper(parent)) {
					return parent;
				}

				parent = parent.parentElement;
			}

			return null;
		}

		user_effect(() => {
			const t = shareStore.currentHoverTarget;

			if (t) {
				// Use untrack to prevent the reset of lastSavedHelperPosition from re-triggering this effect
				const savedPosition = untrack(() => get(lastSavedHelperPosition));

				if (savedPosition) {
					// Apply the saved position (from clicking "Up") to keep the UI stable
					set(style, savedPosition, true);

					set(lastSavedHelperPosition, null // Consume so subsequent hovers update normally
					);
				} else {
					// Standard positioning logic: calculate based on the target element
					const rect = t.getBoundingClientRect();

					let top = rect.top - 23; // Closer to element (was -28)

					if (top < 0) top = rect.top + 5;

					let left = rect.right - 80;

					if (left < 10) left = 10;

					// Ensure it doesn't go off right edge
					if (left + 100 > window.innerWidth) {
						left = window.innerWidth - 110;
					}

					set(style, `top: ${top}px; left: ${left}px;`);
				}

				set(tagName, t.tagName, true);
				set(elementId, t.id || null, true);
				set(canGoUp, !!findNextShareableParent(t));
			} else {
				set(style, 'display: none;');
				set(lastSavedHelperPosition, null);
			}
		});

		function handleSelect(e) {
			e.stopPropagation();

			if (get(target)) shareStore.toggleElementSelection(get(target));
		}

		let helperWidth = state(0);

		function handleSelectParent(e) {
			e.stopPropagation();

			if (!get(target)) return;

			const parent = findNextShareableParent(get(target));

			if (parent) {
				// Pin current style + min-width to prevent shrinking under cursor
				set(lastSavedHelperPosition, `${get(style)} min-width: ${get(helperWidth)}px;`);

				shareStore.setHoverTarget(parent);
			}
		}

		var fragment = comment();
		var node = first_child(fragment);

		{
			var consequent_2 = ($$anchor) => {
				var div = root_1$3();
				var div_1 = child(div);
				var span = child(div_1);
				var text = child(span, true);

				reset(span);

				var node_1 = sibling(span, 2);

				{
					var consequent = ($$anchor) => {
						var span_1 = root_2();
						var text_1 = child(span_1);

						reset(span_1);
						template_effect(() => set_text(text_1, `#${get(elementId) ?? ''}`));
						append($$anchor, span_1);
					};

					if_block(node_1, ($$render) => {
						if (get(elementId)) $$render(consequent);
					});
				}

				reset(div_1);

				var button = sibling(div_1, 2);

				button.__click = handleSelect;

				var text_2 = child(button, true);

				reset(button);

				var node_2 = sibling(button, 2);

				{
					var consequent_1 = ($$anchor) => {
						var button_1 = root_3();

						button_1.__click = handleSelectParent;
						append($$anchor, button_1);
					};

					if_block(node_2, ($$render) => {
						if (get(canGoUp)) $$render(consequent_1);
					});
				}

				reset(div);

				template_effect(() => {
					set_style(div, get(style));
					set_text(text, get(tagName));
					set_class(button, 1, `action-btn ${get(isSelected) ? 'deselect' : 'select'}`, 'svelte-2rmv56');
					set_attribute(button, 'title', get(isSelected) ? "Deselect" : "Select");
					set_text(text_2, get(isSelected) ? '✕' : '✓');
				});

				bind_element_size(div, 'clientWidth', ($$value) => set(helperWidth, $$value));
				transition(3, div, () => fade, () => ({ duration: 100 }));
				append($$anchor, div);
			};

			if_block(node, ($$render) => {
				if (get(target)) $$render(consequent_2);
			});
		}

		append($$anchor, fragment);
		pop();
	}

	delegate(['click']);

	var root_1$2 = from_html(`<div><span class="selection-label svelte-ou9w9b"> </span></div>`);
	var root = from_html(`<div class="share-overlay-ui"><!> <!> <!></div>`);

	const $$css$2 = {
		hash: 'svelte-ou9w9b',
		code: '\n    /* Global styles injected when active */body {cursor:default;}\n\n    /* Highlight outlines */.cv-highlight-target {outline:2px dashed #0078D4 !important;outline-offset:2px;cursor:crosshair;}.cv-share-selected {outline:3px solid #005a9e !important;outline-offset:2px;background-color:rgba(0, 120, 212, 0.05);}.cv-highlight-target-hide {outline:2px dashed #d13438 !important;outline-offset:2px;cursor:crosshair;}.cv-share-selected-hide {outline:3px solid #a4262c !important;outline-offset:2px;background-color:rgba(209, 52, 56, 0.05);}.cv-highlight-target-mode {outline:2px dashed #d97706 !important;outline-offset:2px;cursor:crosshair;}.cv-share-selected-highlight {outline:3px solid #b45309 !important;outline-offset:2px;background-color:rgba(245, 158, 11, 0.05);}.selection-box.svelte-ou9w9b {position:fixed;border:1px solid rgba(0, 120, 212, 0.4);background-color:rgba(0, 120, 212, 0.1);pointer-events:none;z-index:10000;box-sizing:border-box;}.selection-box.hide-mode.svelte-ou9w9b {border:1px solid rgba(209, 52, 56, 0.4);background-color:rgba(209, 52, 56, 0.1);}.selection-box.highlight-mode.svelte-ou9w9b {border:1px solid rgba(255, 140, 0, 0.6); /* Orange/Gold for highlight */background-color:rgba(255, 140, 0, 0.1);}.selection-label.svelte-ou9w9b {position:absolute;top:-24px;left:0;background:#0078D4;color:white;padding:2px 6px;font-size:11px;border-radius:3px;white-space:nowrap;font-family:sans-serif;opacity:0.9;}.hide-mode.svelte-ou9w9b .selection-label:where(.svelte-ou9w9b) {background:#d13438;}.highlight-mode.svelte-ou9w9b .selection-label:where(.svelte-ou9w9b) {background:#d97706; /* Darker orange for text bg */}'
	};

	function ShareOverlay($$anchor, $$props) {
		push($$props, true);
		append_styles$1($$anchor, $$css$2);

		let excludedTags = prop($$props, 'excludedTags', 19, () => ['HEADER', 'NAV', 'FOOTER']),
			excludedIds = prop($$props, 'excludedIds', 19, () => ['cv-floating-action-bar', 'cv-hover-helper']);

		let excludedTagSet = user_derived(() => new Set(excludedTags().map((t) => t.toUpperCase())));
		let excludedIdSet = user_derived(() => new Set(excludedIds()));
		let isDragging = state(false);
		let dragStart = state(null);
		let dragCurrent = state(null);
		let wasDragging = false;

		// Cache candidates when active to avoid repeated DOM queries
		let cachedCandidates = [];

		let selectionBox = user_derived(() => {
			if (!get(dragStart) || !get(dragCurrent) || !get(isDragging)) return null;

			const left = Math.min(get(dragStart).x, get(dragCurrent).x);
			const top = Math.min(get(dragStart).y, get(dragCurrent).y);
			const width = Math.abs(get(dragCurrent).x - get(dragStart).x);
			const height = Math.abs(get(dragCurrent).y - get(dragStart).y);

			return { left, top, width, height };
		});

		/**
		 * Handles window-level mouse hover events to identify and highlight shareable elements.
		 */
		function handleHover(e) {
			if (!shareStore.isActive || get(isDragging)) return;

			const target = e.target;

			// 1. If we are on the helper or toolbar, do nothing (keep current selection)
			if (target.closest('.hover-helper') || target.closest('.floating-bar')) {
				return;
			}

			// 2. Exclude by Tag/ID
			if (isOrHasExcludedParentElement(target)) return;

			// 3. Find nearest shareable
			const shareablePart = target.closest(SHAREABLE_SELECTOR);

			// If not on a shareable part, clear selection immediately
			if (!shareablePart) {
				shareStore.setHoverTarget(null);

				return;
			}

			const finalTarget = shareablePart;

			// Check ancestors selection (level up logic) 
			let parent = finalTarget.parentElement;

			let selectedAncestor = null;

			while (parent) {
				if (shareStore.selectedElements.has(parent)) {
					selectedAncestor = parent;

					break;
				}

				parent = parent.parentElement;
			}

			if (selectedAncestor) {
				shareStore.setHoverTarget(selectedAncestor);

				return;
			}

			// New target
			if (isGenericWrapper(finalTarget)) {
				shareStore.setHoverTarget(null);

				return;
			}

			// Check selection is not child of current hover target
			if (shareStore.currentHoverTarget !== finalTarget) {
				if (shareStore.currentHoverTarget && shareStore.currentHoverTarget.contains(finalTarget)) {
					return;
				}

				shareStore.setHoverTarget(finalTarget);
			}
		}

		/**
		 * Handles mouse down events to start a selection drag.
		 */
		function handleMouseDown(e) {
			if (!shareStore.isActive) return;

			// Ignore clicks on UI
			const target = e.target;

			if (target.closest('.floating-bar') || target.closest('.hover-helper')) return;

			// Disable drag on touch devices
			if (window.matchMedia('(pointer: coarse)').matches) return;

			set(dragStart, { x: e.clientX, y: e.clientY }, true);
			set(dragCurrent, { x: e.clientX, y: e.clientY }, true);
			set(isDragging, false);
			wasDragging = false; // Ensure clean state
		}

		function handleMouseMove(e) {
			if (!get(dragStart)) return;

			set(dragCurrent, { x: e.clientX, y: e.clientY }, true);

			const dx = e.clientX - get(dragStart).x;
			const dy = e.clientY - get(dragStart).y;

			if (Math.hypot(dx, dy) > 12) {
				set(isDragging, true);
				shareStore.setHoverTarget(null); // Clear highlight on drag start
			}
		}

		function handleMouseUp(_) {
			if (get(isDragging) && get(dragStart) && get(dragCurrent)) {
				// Perform selection logic
				const width = Math.abs(get(dragCurrent).x - get(dragStart).x);

				const height = Math.abs(get(dragCurrent).y - get(dragStart).y);

				// Optimization: Skip if drag area is too small (avoids accidental micro-selections)
				if (width < 10 || height < 10) {
					set(isDragging, false);
					set(dragStart, null);
					set(dragCurrent, null);

					return;
				}

				const left = Math.min(get(dragStart).x, get(dragCurrent).x);
				const top = Math.min(get(dragStart).y, get(dragCurrent).y);
				const right = left + width;
				const bottom = top + height;

				// Populate cache only if needed (lazy loading)
				if (cachedCandidates.length === 0) {
					cachedCandidates = Array.from(document.querySelectorAll(SHAREABLE_SELECTOR));
				}

				const selected = [];

				cachedCandidates.forEach((node) => {
					const el = node;

					if (isOrHasExcludedParentElement(el)) return;

					const rect = el.getBoundingClientRect();

					// Check containment (element must be fully inside selection box)
					// AND check if it's not just a generic wrapper
					if (rect.left >= left && rect.right <= right && rect.top >= top && rect.bottom <= bottom && !isGenericWrapper(el)) {
						selected.push(el);
					}
				});

				if (selected.length > 0) {
					shareStore.addMultipleElements(selected);
				}

				wasDragging = true;
			}

			set(isDragging, false);
			set(dragStart, null);
			set(dragCurrent, null);
		}

		function handleClick(e) {
			if (wasDragging) {
				e.preventDefault();
				e.stopPropagation();
				wasDragging = false; // Synchronous reset

				return;
			}

			const target = e.target;

			if (target.closest('.hover-helper') || target.closest('.floating-bar')) return;

			// Intercept click on document
			e.preventDefault();

			e.stopPropagation();

			// If we have a hover target, toggle it
			const currentTarget = shareStore.currentHoverTarget;

			if (currentTarget) {
				shareStore.toggleElementSelection(currentTarget);
			}
		}

		function handleKeydown(e) {
			if (e.key === 'Escape') {
				e.preventDefault();
				shareStore.toggleActive(false);
			}
		}

		function isOrHasExcludedParentElement(el) {
			// Exclude our own UI
			if (el.closest('.share-overlay-ui') || el.closest('.hover-helper') || el.closest('.floating-bar')) {
				return true;
			}

			// Check self
			if (get(excludedTagSet).has(el.tagName.toUpperCase()) || el.id && get(excludedIdSet).has(el.id)) {
				return true;
			}

			// Check  all the way up
			let ancestor = el.parentElement;

			while (ancestor) {
				if (get(excludedTagSet).has(ancestor.tagName.toUpperCase()) || ancestor.id && get(excludedIdSet).has(ancestor.id)) {
					return true;
				}

				ancestor = ancestor.parentElement;
			}

			return false;
		}

		var div = root();

		event('mouseover', $window, handleHover);
		event('mousedown', $window, handleMouseDown);
		event('mousemove', $window, handleMouseMove);
		event('mouseup', $window, handleMouseUp);
		event('click', $window, handleClick, true);
		event('keydown', $window, handleKeydown);

		var node_1 = child(div);

		ShareToolbar(node_1, {});

		var node_2 = sibling(node_1, 2);

		HoverHelper(node_2, {});

		var node_3 = sibling(node_2, 2);

		{
			var consequent = ($$anchor) => {
				var div_1 = root_1$2();
				var span = child(div_1);
				var text = child(span, true);

				reset(span);
				reset(div_1);

				template_effect(() => {
					set_class(
						div_1,
						1,
						`selection-box ${shareStore.selectionMode === 'hide'
						? 'hide-mode'
						: shareStore.selectionMode === 'highlight' ? 'highlight-mode' : ''}`,
						'svelte-ou9w9b'
					);

					set_style(div_1, `left: ${get(selectionBox).left ?? ''}px; top: ${get(selectionBox).top ?? ''}px; width: ${get(selectionBox).width ?? ''}px; height: ${get(selectionBox).height ?? ''}px;`);

					set_text(text, shareStore.selectionMode === 'hide'
						? 'Select to hide'
						: shareStore.selectionMode === 'highlight' ? 'Select to highlight' : 'Select to share');
				});

				append($$anchor, div_1);
			};

			if_block(node_3, ($$render) => {
				if (get(selectionBox)) $$render(consequent);
			});
		}

		reset(div);
		append($$anchor, div);
		pop();
	}

	var root_1$1 = from_html(`<div id="cv-exit-focus-banner" class="svelte-1iowue5"><span>You are viewing a focused selection.</span> <button class="svelte-1iowue5">Show Full Page</button></div>`);

	const $$css$1 = {
		hash: 'svelte-1iowue5',
		code: '\n  /* Global Styles for Focus/Highlight Modes */.cv-focus-hidden {display:none !important;}body.cv-focus-mode, \n  body.cv-highlight-mode {margin-top:50px !important;}#cv-exit-focus-banner.svelte-1iowue5 {position:fixed;top:0;left:0;right:0;background-color:#0078D4;color:white;padding:10px 20px;display:flex;align-items:center;justify-content:center;gap:16px;z-index:9000; /* Below Toast (usually 9999+) */font-family:system-ui, sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.2);}button.svelte-1iowue5 {background:white;color:#0078D4;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;font-weight:600;}button.svelte-1iowue5:hover {background:#f0f0f0;}'
	};

	function FocusBanner($$anchor, $$props) {
		push($$props, false);
		append_styles$1($$anchor, $$css$1);

		function handleExit() {
			focusStore.exit();
		}

		init$1();

		var fragment = comment();
		var node = first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var div = root_1$1();
				var button = sibling(child(div), 2);

				button.__click = handleExit;
				reset(div);
				transition(3, div, () => slide, () => ({ duration: 250 }));
				append($$anchor, div);
			};

			if_block(node, ($$render) => {
				if (focusStore.isActive) $$render(consequent);
			});
		}

		append($$anchor, fragment);
		pop();
	}

	delegate(['click']);

	var root_1 = from_html(`<div class="cv-widget-root"><!> <!> <!> <!> <!> <!></div>`);

	const $$css = {
		hash: 'svelte-1ke3hir',
		code: '.cv-widget-root {\n    /* Light Theme Defaults */--cv-bg: white;--cv-text: rgba(0, 0, 0, 0.9);--cv-text-secondary: rgba(0, 0, 0, 0.6);--cv-border: rgba(0, 0, 0, 0.1);--cv-bg-hover: rgba(0, 0, 0, 0.05);--cv-primary: #3e84f4;--cv-primary-hover: #2563eb;--cv-danger: #dc2626;--cv-danger-bg: rgba(220, 38, 38, 0.1);--cv-shadow: rgba(0, 0, 0, 0.25);--cv-input-bg: white;--cv-input-border: rgba(0, 0, 0, 0.15);--cv-switch-bg: rgba(0, 0, 0, 0.1);--cv-switch-knob: white;--cv-modal-icon-bg: rgba(0, 0, 0, 0.08);--cv-icon-bg: rgba(255, 255, 255, 0.92);--cv-icon-color: rgba(0, 0, 0, 0.9);--cv-focus-ring: rgba(62, 132, 244, 0.2);--cv-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);font-family:inherit; /* Inherit font from host */}.cv-widget-root[data-theme="dark"] {\n    /* Dark Theme Overrides */--cv-bg: #101722;--cv-text: #e2e8f0;--cv-text-secondary: rgba(255, 255, 255, 0.6);--cv-border: rgba(255, 255, 255, 0.1);--cv-bg-hover: rgba(255, 255, 255, 0.05);--cv-primary: #3e84f4;--cv-primary-hover: #60a5fa;--cv-danger: #f87171;--cv-danger-bg: rgba(248, 113, 113, 0.1);--cv-shadow: rgba(0, 0, 0, 0.5);--cv-input-bg: #1e293b;--cv-input-border: rgba(255, 255, 255, 0.1);--cv-switch-bg: rgba(255, 255, 255, 0.1);--cv-switch-knob: #e2e8f0;--cv-modal-icon-bg: rgba(255, 255, 255, 0.08);--cv-icon-bg: #1e293b;--cv-icon-color: #e2e8f0;--cv-focus-ring: rgba(62, 132, 244, 0.5);--cv-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);}'
	};

	function Settings($$anchor, $$props) {
		push($$props, true);
		append_styles$1($$anchor, $$css);

		// Derived state
		const store = user_derived(() => $$props.core.store);

		// UI State
		let isModalOpen = state(false);

		let showCallout = state(false);
		let isResetting = state(false);
		let showPulse = state(false);
		let settingsIcon = state(void 0);

		// Nav Visibility
		let navsVisible = state(true);

		// Computed Props for ShareOverlay
		const config = user_derived(() => $$props.core.store.config);

		const shareExclusions = user_derived(() => get(config).shareExclusions || {});

		const excludedTags = user_derived(() => [
			...DEFAULT_EXCLUDED_TAGS,
			...get(shareExclusions).tags || []
		]);

		const excludedIds = user_derived(() => [...DEFAULT_EXCLUDED_IDS, ...get(shareExclusions).ids || []]);

		// Reactively track store state for passing to Modal
		let shownToggles = user_derived(() => get(store).state.shownToggles ?? []);

		let peekToggles = user_derived(() => get(store).state.peekToggles ?? []);
		let activeTabs = user_derived(() => get(store).state.tabs ?? {});

		// Placeholder State
		let definitions = user_derived(() => placeholderRegistryStore.definitions);

		let values = user_derived(() => placeholderValueStore.values);

		// Init
		onMount(() => {
			// Check Nav Visibility
			// Store is the single source of truth, handled by Core's persistence effect
			set(navsVisible, get(store).isTabGroupNavHeadingVisible, true);

			// Init Theme Store
			themeStore.init();

			return themeStore.listen();
		});

		let introChecked = false;

		user_effect(() => {
			if (!introChecked && $$props.options.callout?.show) {
				// Only show if there are actual components on the page
				if (get(store).hasPageElements) {
					introChecked = true;
					checkIntro();
				}
			}
		});

		function checkIntro() {
			try {
				if (!localStorage.getItem('cv-intro-shown')) {
					setTimeout(
						() => {
							set(showCallout, true);
							set(showPulse, true);
						},
						1000
					);
				}
			} catch(e) {}
		}

		function dismissCallout() {
			set(showCallout, false);
			set(showPulse, false);

			try {
				localStorage.setItem('cv-intro-shown', 'true');
			} catch(e) {}
		}

		function openModal() {
			if (get(showCallout)) dismissCallout();

			try {
				localStorage.setItem('cv-intro-shown', 'true');
			} catch(e) {}

			set(isModalOpen, true);
		}

		function closeModal() {
			set(isModalOpen, false);
		}

		// --- Handlers ---
		function handleReset() {
			set(isResetting, true);
			$$props.core.resetToDefault();
			get(settingsIcon)?.resetPosition();

			// Sync local state
			set(navsVisible, true);

			showToast('Settings reset to default');

			setTimeout(
				() => {
					set(isResetting, false);
				},
				600
			);
		}

		function handleToggleChange(detail) {
			const { toggleId, value } = detail;
			const currentShown = get(store).state.shownToggles || [];
			const currentPeek = get(store).state.peekToggles || [];
			const newShown = currentShown.filter((id) => id !== toggleId);
			const newPeek = currentPeek.filter((id) => id !== toggleId);

			if (value === 'show') newShown.push(toggleId);
			if (value === 'peek') newPeek.push(toggleId);

			get(store).setToggles(newShown, newPeek);
		}

		function handleTabGroupChange(detail) {
			const { groupId, tabId } = detail;

			// Scroll Logic: Capture target before state update
			const groupToScrollTo = findHighestVisibleElement('cv-tabgroup');

			get(store).setPinnedTab(groupId, tabId);

			// Restore scroll after update
			if (groupToScrollTo) {
				queueMicrotask(() => {
					scrollToElement(groupToScrollTo);
				});
			}
		}

		function handleNavToggle(visible) {
			set(navsVisible, visible, true);

			// Core's effect will capture this change and persist it
			get(store).isTabGroupNavHeadingVisible = visible;
		}

		function handleCopyShareUrl() {
			const url = URLStateManager.generateShareableURL(get(store).state);

			navigator.clipboard.writeText(url).then(() => {
				showToast('Link copied to clipboard!');
			}).catch(() => {
				showToast('Failed to copy URL!');
			});
		}

		function handleStartShare() {
			closeModal();
			shareStore.toggleActive(true);
		}

		function handleVariableChange(e) {
			const { name, value } = e;

			placeholderValueStore.set(name, value);
		}

		var fragment = comment();
		var node = first_child(fragment);

		{
			var consequent_3 = ($$anchor) => {
				var div = root_1();
				var node_1 = child(div);

				{
					var consequent = ($$anchor) => {
						{
							let $0 = user_derived(() => $$props.options.callout?.message);
							let $1 = user_derived(() => $$props.options.callout?.enablePulse);
							let $2 = user_derived(() => $$props.options.callout?.backgroundColor);
							let $3 = user_derived(() => $$props.options.callout?.textColor);

							IntroCallout($$anchor, {
								get position() {
									return $$props.options.icon.position;
								},

								get message() {
									return get($0);
								},

								get enablePulse() {
									return get($1);
								},

								get backgroundColor() {
									return get($2);
								},

								get textColor() {
									return get($3);
								},

								onclose: dismissCallout
							});
						}
					};

					if_block(node_1, ($$render) => {
						if (get(showCallout)) $$render(consequent);
					});
				}

				var node_2 = sibling(node_1, 2);

				Toast(node_2, {});

				var node_3 = sibling(node_2, 2);

				{
					var consequent_1 = ($$anchor) => {
						ShareOverlay($$anchor, {
							get excludedTags() {
								return get(excludedTags);
							},

							get excludedIds() {
								return get(excludedIds);
							}
						});
					};

					if_block(node_3, ($$render) => {
						if (shareStore.isActive) $$render(consequent_1);
					});
				}

				var node_4 = sibling(node_3, 2);

				FocusBanner(node_4, {});

				var node_5 = sibling(node_4, 2);

				{
					let $0 = user_derived(() => $$props.options.icon?.color);
					let $1 = user_derived(() => $$props.options.icon?.backgroundColor);
					let $2 = user_derived(() => $$props.options.icon?.opacity);
					let $3 = user_derived(() => $$props.options.icon?.scale);

					bind_this(
						SettingsIcon(node_5, {
							get position() {
								return $$props.options.icon.position;
							},

							get title() {
								return $$props.options.panel.title;
							},

							get pulse() {
								return get(showPulse);
							},

							onclick: openModal,

							get iconColor() {
								return get($0);
							},

							get backgroundColor() {
								return get($1);
							},

							get opacity() {
								return get($2);
							},

							get scale() {
								return get($3);
							}
						}),
						($$value) => set(settingsIcon, $$value, true),
						() => get(settingsIcon)
					);
				}

				var node_6 = sibling(node_5, 2);

				{
					var consequent_2 = ($$anchor) => {
						Modal($$anchor, {
							get title() {
								return $$props.options.panel.title;
							},

							get description() {
								return $$props.options.panel.description;
							},

							get showReset() {
								return $$props.options.panel.showReset;
							},

							get showTabGroups() {
								return $$props.options.panel.showTabGroups;
							},

							get toggles() {
								return get(store).menuToggles;
							},

							get tabGroups() {
								return get(store).menuTabGroups;
							},

							get shownToggles() {
								return get(shownToggles);
							},

							get peekToggles() {
								return get(peekToggles);
							},

							get activeTabs() {
								return get(activeTabs);
							},

							get navsVisible() {
								return get(navsVisible);
							},

							get isResetting() {
								return get(isResetting);
							},

							get placeholderDefinitions() {
								return get(definitions);
							},

							get placeholderValues() {
								return get(values);
							},

							onclose: closeModal,
							onreset: handleReset,
							ontoggleChange: handleToggleChange,
							ontabGroupChange: handleTabGroupChange,
							ontoggleNav: handleNavToggle,
							oncopyShareUrl: handleCopyShareUrl,
							onstartShare: handleStartShare,
							onvariableChange: handleVariableChange
						});
					};

					if_block(node_6, ($$render) => {
						if (get(isModalOpen)) $$render(consequent_2);
					});
				}

				reset(div);
				template_effect(() => set_attribute(div, 'data-theme', themeStore.currentTheme));
				append($$anchor, div);
			};

			if_block(node, ($$render) => {
				if (get(store).hasMenuOptions || $$props.options.showTabGroups || shareStore.isActive || focusStore.isActive) $$render(consequent_3);
			});
		}

		append($$anchor, fragment);
		pop();
	}

	class CustomViewsSettings {
	    app = null;
	    options;
	    constructor(options) {
	        // Set defaults
	        this.options = {
	            core: options.core, // 'core' is a required property and must be explicitly passed
	            container: options.container || document.body,
	            theme: options.theme || 'light',
	            panel: {
	                title: options.panel?.title || 'Customize View',
	                description: options.panel?.description || '',
	                showTabGroups: options.panel?.showTabGroups ?? true,
	                showReset: options.panel?.showReset ?? true
	            },
	            callout: {
	                show: options.callout?.show ?? false,
	                message: options.callout?.message || 'Customize your reading experience here.',
	                enablePulse: options.callout?.enablePulse ?? true,
	                backgroundColor: options.callout?.backgroundColor,
	                textColor: options.callout?.textColor
	            },
	            icon: {
	                position: options.icon?.position || 'middle-left',
	                color: options.icon?.color,
	                backgroundColor: options.icon?.backgroundColor,
	                opacity: options.icon?.opacity,
	                scale: options.icon?.scale ?? 1
	            }
	        };
	    }
	    /**
	     * Render the settings widget
	     */
	    renderModalIcon() {
	        if (this.app) {
	            return;
	        }
	        // Mount Svelte App using Svelte 5 API
	        this.app = mount(Settings, {
	            target: this.options.container,
	            props: {
	                core: this.options.core,
	                options: this.options
	            }
	        });
	    }
	    /**
	     * Remove the settings widget from DOM
	     */
	    destroy() {
	        if (this.app) {
	            unmount(this.app);
	            this.app = null;
	        }
	    }
	}

	/**
	 * Finds the script tag that loaded the library and extracts configuration attributes.
	 * Looks for `data-base-url` and `data-config-path`.
	 */
	function getScriptAttributes() {
	    let scriptTag = document.currentScript;
	    const defaults = { baseURL: '', configPath: '/customviews.config.json' };
	    if (!scriptTag || !scriptTag.hasAttribute('data-base-url')) {
	        const dataAttrMatch = document.querySelector('script[data-base-url]');
	        if (dataAttrMatch) {
	            scriptTag = dataAttrMatch;
	        }
	        else {
	            // Fallback: try to find script by src pattern
	            for (const script of document.scripts) {
	                const src = script.src || '';
	                if (/(?:custom[-_]views|@customviews-js\/customviews)(?:\.min)?\.(?:esm\.)?js($|\?)/i.test(src)) {
	                    scriptTag = script;
	                    break;
	                }
	            }
	        }
	    }
	    if (scriptTag) {
	        return {
	            baseURL: scriptTag.getAttribute('data-base-url') || defaults.baseURL,
	            configPath: scriptTag.getAttribute('data-config-path') || defaults.configPath
	        };
	    }
	    return defaults;
	}
	/**
	 * Fetches and parses the configuration file.
	 */
	async function fetchConfig(configPath, baseURL) {
	    // Default minimal config
	    const fallbackConfig = {
	        config: {},
	        settings: { enabled: true }
	    };
	    try {
	        const fullConfigPath = prependBaseUrl(configPath, baseURL);
	        console.log(`[CustomViews] Loading config from: ${fullConfigPath}`);
	        const response = await fetch(fullConfigPath);
	        if (!response.ok) {
	            console.warn(`[CustomViews] Config file not found at ${fullConfigPath}. Using defaults.`);
	            return fallbackConfig;
	        }
	        else {
	            const config = await response.json();
	            console.log('[CustomViews] Config loaded successfully');
	            return config;
	        }
	    }
	    catch (error) {
	        console.error('[CustomViews] Error loading config file:', error);
	        return fallbackConfig;
	    }
	}
	/**
	 * Initializes the settings if enabled in the config.
	 */
	function initializeWidget(core, config) {
	    if (config.settings?.enabled !== false) {
	        const settings = new CustomViewsSettings({
	            core,
	            ...config.settings
	        });
	        settings.renderModalIcon();
	        console.log('[CustomViews] Settings initialized and rendered');
	        return settings;
	    }
	    else {
	        console.log('[CustomViews] Settings disabled in config - skipping initialization');
	        return undefined;
	    }
	}

	/**
	 * Main initialization function.
	 * This is aliased as `CustomViews.init` in the global namespace because it's a named export.
	 */
	const init = CustomViews.init;
	/**
	 * Initialize CustomViews from script tag attributes and config file
	 * This runs automatically when the script is loaded.
	 */
	function initializeFromScript() {
	    // Only run in browser environment
	    if (typeof window === 'undefined')
	        return;
	    // Idempotency check
	    if (window.__customViewsInitialized) {
	        console.info('[CustomViews] Auto-init skipped: already initialized.');
	        return;
	    }
	    document.addEventListener('DOMContentLoaded', async function () {
	        if (window.__customViewsInitInProgress || window.__customViewsInitialized)
	            return;
	        window.__customViewsInitInProgress = true;
	        try {
	            // 1. Get attributes from script tag
	            const { baseURL, configPath } = getScriptAttributes();
	            // 2. Fetch Config
	            const configFile = await fetchConfig(configPath, baseURL);
	            // Determine effective baseURL (data attribute takes precedence)
	            const effectiveBaseURL = baseURL || configFile.baseUrl || '';
	            const options = {
	                baseURL: effectiveBaseURL,
	            };
	            if (configFile.config) {
	                options.config = configFile.config;
	            }
	            if (configFile.assetsJsonPath) {
	                options.assetsJsonPath = configFile.assetsJsonPath;
	            }
	            if (configFile.showUrl !== undefined) {
	                options.showUrl = configFile.showUrl;
	            }
	            // 3. Initialize Core
	            const core = await CustomViews.init(options);
	            if (!core) {
	                console.error('[CustomViews] Failed to initialize core.');
	                return;
	            }
	            // Store instance on the global object for debugging/access
	            window.customViewsInstance = { core };
	            // 4. Initialize Settings
	            const settings = initializeWidget(core, configFile);
	            if (settings) {
	                window.customViewsInstance.settings = settings;
	            }
	            // Mark initialized
	            window.__customViewsInitialized = true;
	            window.__customViewsInitInProgress = false;
	        }
	        catch (error) {
	            window.__customViewsInitInProgress = false;
	            console.error('[CustomViews] Auto-initialization error:', error);
	        }
	    });
	}
	// Auto-run initialization logic when this file is evaluated
	if (typeof window !== "undefined") {
	    initializeFromScript();
	}

	exports.AssetsManager = AssetsManager;
	exports.CustomViews = CustomViews;
	exports.CustomViewsCore = CustomViewsCore;
	exports.CustomViewsSettings = CustomViewsSettings;
	exports.PersistenceManager = PersistenceManager;
	exports.URLStateManager = URLStateManager;
	exports.init = init;
	exports.initializeFromScript = initializeFromScript;

}));
//# sourceMappingURL=custom-views.js.map
