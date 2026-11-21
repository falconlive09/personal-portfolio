import type { BlogPost } from '@/types';

// Blog posts, newest first. `body` is rendered by src/components/blog/ArticleBody.tsx.
const author = { name: 'Neal Gautam', avatar: '/about/neal.webp' };
const img = (id: string, w = 2000) => `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop&fm=webp`;

export const blogPosts: BlogPost[] = [
    {
        id: 'blog-fraud-pipeline',
        slug: 'designing-a-40k-tps-fraud-check',
        title: 'Designing a Real-Time Fraud Check at 40K TPS',
        excerpt: 'How to fit feature lookups, rules and an ML score into a ~30 ms budget without letting the fraud check become the outage.',
        content: '',
        image: img('photo-1558494949-ef010cbdcc31'),
        date: '2026-11-08',
        category: 'system-design',
        tags: ['System Design', 'Kafka', 'Cassandra', 'Latency', 'Payments'],
        author,
        readTime: '9',
        body: [
            { type: 'callout', title: 'A note on numbers', text: 'The latencies and table shapes below are illustrative design notes, not any company’s production configuration.' },
            { type: 'h2', id: 'problem', toc: 'The problem', text: 'The problem' },
            { type: 'p', text: 'Every payment needs a risk decision **before** it is approved. The check sits on the critical path, so it inherits the strictest requirements of the whole system: a p99 budget of a few tens of milliseconds, peaks of **40,000 transactions per second**, and zero tolerance for taking payments down when something behind it is slow.' },
            { type: 'p', text: 'That combination drives almost every design decision: anything that is expensive to compute must be computed ahead of time, and anything that can fail must have a defined fallback.' },
            { type: 'h2', id: 'shape', toc: 'Shape of the pipeline', text: 'The shape of the pipeline' },
            { type: 'ol', items: [
                '**Validate** the request and attach a correlation id.',
                '**Fetch features** in parallel: payer velocity, device and merchant risk, recent declines.',
                '**Score**: a deterministic rules engine and an ML model run side by side.',
                '**Decide**: approve, decline or step-up, and write an audit record.',
                '**Publish** the outcome to Kafka so feature builders and case management update asynchronously.',
            ] },
            { type: 'p', text: 'The important split is between the **synchronous path** (steps 1–4) and everything else. Kafka is on the asynchronous side: the request never waits on a produce-then-consume round trip.' },
            { type: 'h2', id: 'features', toc: 'Precompute features', text: 'Features: precompute, don’t query' },
            { type: 'p', text: 'A question like “how many payments has this payer made in the last 10 minutes?” is too slow to answer with an aggregate query at request time. Instead, stream consumers keep windowed aggregates up to date and the scorer does a single-partition read.' },
            { type: 'code', lang: 'sql', caption: 'One partition per payer, newest window first, expired automatically.', code: `CREATE TABLE payer_velocity (
  payer_id     text,
  window_start timestamp,
  txn_count    int,
  amount_paise bigint,
  PRIMARY KEY ((payer_id), window_start)
) WITH CLUSTERING ORDER BY (window_start DESC)
  AND default_time_to_live = 172800;

-- request path: one partition, a handful of rows
SELECT txn_count, amount_paise
FROM payer_velocity
WHERE payer_id = ? AND window_start >= ?;` },
            { type: 'p', text: 'Cassandra counters look tempting here, but counter columns cannot carry a TTL and are not idempotent on retry. Writing plain integers computed by the stream processor avoids both problems.' },
            { type: 'h2', id: 'partitioning', toc: 'Partitioning & ordering', text: 'Partitioning and ordering' },
            { type: 'p', text: 'Keying the Kafka topic by `payer_id` means every event for a payer lands on the same partition, is processed in order, and is owned by exactly one consumer. That makes per-payer aggregates race-free without locks.' },
            { type: 'p', text: 'Merchant-level features are different: a large merchant is a **hot key**. Salting the key (`merchantId#0..7`) spreads the load, and a second small step merges the partial aggregates.' },
            { type: 'h2', id: 'budget', toc: 'Latency budget', text: 'A latency budget you can defend' },
            { type: 'table', head: ['Step', 'p99 budget'], rows: [
                ['Validation & auth', '3 ms'],
                ['Feature fetch (parallel)', '8 ms'],
                ['Rules engine', '2 ms'],
                ['Model score', '10 ms'],
                ['Decision + audit write', '4 ms'],
                ['Headroom', '3 ms'],
            ] },
            { type: 'p', text: 'Writing the budget down per step turns “it feels slow” into a concrete question: which step blew its budget? Each dependency gets a timeout equal to its budget, not a generic 1-second default.' },
            { type: 'h2', id: 'fail-safe', toc: 'Failing safe', text: 'Failing safe' },
            { type: 'ul', items: [
                '**Model timeout → rules-only score.** The model is a bypassable enhancement, never a hard dependency.',
                '**Feature store slow → conservative defaults** per risk tier: low-value payments continue, high-value ones step up.',
                '**Circuit breakers** around every remote call, so a struggling dependency is shed instead of queued behind.',
                '**Every bypass is logged and counted**, so a silent degradation shows up on a dashboard rather than in a fraud report.',
            ] },
            { type: 'quote', text: 'A fraud check that takes payments down has done the fraudsters’ job for them.' },
            { type: 'h2', id: 'testing', toc: 'Load testing', text: 'Load testing at 40K TPS' },
            { type: 'p', text: 'Measure **p99 and p99.9**, not averages, and use a load generator that avoids coordinated omission (it must keep sending at the target rate even when responses slow down). On the JVM, watch GC pauses alongside latency; generational ZGC keeps pause times well below a millisecond, which matters when the whole budget is 30 ms.' },
        ],
        resources: [
            { title: 'Apache Kafka documentation', kind: 'Docs', category: 'Streaming', url: 'https://kafka.apache.org/documentation/', image: img('photo-1451187580459-43490279c0fa', 400) },
            { title: 'Designing Data-Intensive Applications', kind: 'Book', category: 'Architecture', url: 'https://dataintensive.net/', image: img('photo-1544383835-bda2bc66a55d', 400) },
            { title: 'Apache Cassandra data modeling', kind: 'Docs', category: 'Database', url: 'https://cassandra.apache.org/doc/latest/', image: img('photo-1558494949-ef010cbdcc31', 400) },
        ],
    },
    {
        id: 'blog-java-25',
        slug: 'java-25-for-backend-engineers',
        title: 'Java 25 for Backend Engineers: What Actually Changes',
        excerpt: 'Scoped values, flexible constructors, pinning-free virtual threads and smaller object headers: the LTS features that matter for services.',
        content: '',
        image: img('photo-1555066931-4365d14bab8c'),
        date: '2026-10-18',
        category: 'software-development',
        tags: ['Java', 'Java 25', 'JVM', 'Virtual Threads', 'Spring Boot'],
        author,
        readTime: '8',
        body: [
            { type: 'h2', id: 'why', toc: 'Why upgrade', text: 'Why this LTS matters' },
            { type: 'p', text: 'Most backend teams jump from LTS to LTS, so moving from Java 21 to **Java 25** picks up four releases of work at once. For services, the headline is that virtual threads finally behave the way people assumed they would in 21, and that a handful of preview features became final.' },
            { type: 'h2', id: 'virtual-threads', toc: 'Virtual threads, unpinned', text: 'Virtual threads without pinning' },
            { type: 'p', text: 'In Java 21, a virtual thread that blocked inside a `synchronized` block **pinned** its carrier thread. Under load, a few pinned threads could starve the scheduler. Since JDK 24 (JEP 491), virtual threads can block inside `synchronized` and release the carrier, so older libraries that use `synchronized` internally no longer need rewriting before you switch.' },
            { type: 'code', lang: 'java', code: `// Spring Boot: one property moves request handling onto virtual threads
spring.threads.virtual.enabled=true

// Plain Java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    requests.forEach(r -> executor.submit(() -> handle(r)));
}` },
            { type: 'h2', id: 'scoped-values', toc: 'Scoped values', text: 'Scoped values replace most ThreadLocals' },
            { type: 'p', text: 'Scoped values (final in JEP 506) carry immutable context, such as a request id or tenant, down the call stack. Unlike `ThreadLocal`, the binding ends when the scope ends, cannot be mutated, and is cheap to inherit across millions of virtual threads.' },
            { type: 'code', lang: 'java', code: `private static final ScopedValue<RequestContext> CTX = ScopedValue.newInstance();

void handle(Request req) {
    ScopedValue.where(CTX, RequestContext.from(req))
               .run(() -> paymentService.process(req));
}

// anywhere deeper in the call stack
String traceId = CTX.get().traceId();` },
            { type: 'h2', id: 'constructors', toc: 'Flexible constructors', text: 'Validate before super()' },
            { type: 'p', text: 'Flexible constructor bodies (JEP 513) let you run statements before `super(...)`, as long as they don’t touch `this`. Validation no longer needs static helper methods.' },
            { type: 'code', lang: 'java', code: `public final class PositiveAmount extends Amount {
    public PositiveAmount(long paise) {
        if (paise <= 0) {
            throw new IllegalArgumentException("amount must be positive: " + paise);
        }
        super(paise);
    }
}` },
            { type: 'h2', id: 'streams', toc: 'Stream gatherers', text: 'Stream gatherers' },
            { type: 'p', text: 'Gatherers (final in JDK 24) add custom intermediate operations. The built-ins already cover common batch jobs: fixed windows for bulk writes, and `mapConcurrent` for bounded fan-out on virtual threads.' },
            { type: 'code', lang: 'java', code: `// write in batches of 500
transactions.stream()
    .gather(Gatherers.windowFixed(500))
    .forEach(repository::saveAll);

// call a downstream API with at most 32 requests in flight
List<Score> scores = ids.stream()
    .gather(Gatherers.mapConcurrent(32, riskClient::score))
    .toList();` },
            { type: 'h2', id: 'runtime', toc: 'Runtime wins', text: 'Free runtime wins' },
            { type: 'table', head: ['Feature', 'JEP', 'What you get'], rows: [
                ['Compact object headers', '519', 'Headers shrink from 12 to 8 bytes; less heap for object-heavy services. Opt in with `-XX:+UseCompactObjectHeaders`.'],
                ['Generational Shenandoah', '521', 'Production-ready generational mode for the low-pause collector.'],
                ['Generational ZGC by default', '474', 'Sub-millisecond pauses with better throughput than single-generation ZGC.'],
                ['AOT cache ergonomics', '514 / 515', 'One training run produces a cache with loaded classes and method profiles; faster startup and warm-up.'],
            ] },
            { type: 'h2', id: 'small-things', toc: 'Smaller niceties', text: 'Smaller niceties' },
            { type: 'ul', items: [
                '**Compact source files** (JEP 512): `void main() { IO.println("hi"); }` is a complete program, which is handy for scripts and teaching.',
                '**Module imports** (JEP 511): `import module java.base;` in place of a wall of imports.',
                '**Unnamed variables** (final since 22): `catch (TimeoutException _)` says the value is intentionally unused.',
                '**Structured concurrency** is still in preview (fifth round), but `StructuredTaskScope.open()` is close to final and worth trying behind `--enable-preview`.',
            ] },
            { type: 'h2', id: 'upgrade', toc: 'Upgrade checklist', text: 'Upgrade checklist' },
            { type: 'ol', items: [
                'Bump the build toolchain and run the test suite on 25 before changing any code.',
                'The Security Manager is permanently disabled (JEP 486); remove any `-Djava.security.manager` flags.',
                'Watch for `sun.misc.Unsafe` memory-access warnings from older libraries and update them.',
                'Enable virtual threads behind a flag, load test, and compare p99 latency and carrier-thread usage.',
                'Try compact object headers in a canary and compare heap usage before rolling out.',
            ] },
        ],
        resources: [
            { title: 'JDK 25 release page', kind: 'Docs', category: 'OpenJDK', url: 'https://openjdk.org/projects/jdk/25/', image: img('photo-1555066931-4365d14bab8c', 400) },
            { title: 'JEP 491: Synchronize virtual threads without pinning', kind: 'JEP', category: 'Concurrency', url: 'https://openjdk.org/jeps/491', image: img('photo-1515879218367-8466d910aaa4', 400) },
            { title: 'JEP 506: Scoped Values', kind: 'JEP', category: 'Language', url: 'https://openjdk.org/jeps/506', image: img('photo-1526379095098-d400fd0bf935', 400) },
        ],
    },
    {
        id: 'blog-ai-annotation',
        slug: 'lessons-from-ai-data-annotation',
        title: 'What AI Data Annotation Taught Me About Model Quality',
        excerpt: 'Rubrics, edge cases and agreement scores: why the labelling work behind a model matters as much as the model itself.',
        content: '',
        image: img('photo-1620712943543-bcc4688e7485'),
        date: '2026-09-27',
        category: 'applied-ai',
        tags: ['AI', 'Data Annotation', 'RLHF', 'LLM', 'Data Quality'],
        author,
        readTime: '7',
        body: [
            { type: 'h2', id: 'what', toc: 'What the work is', text: 'What annotation work actually is' },
            { type: 'p', text: 'Behind every assistant-style model is a large amount of human judgement. The work goes well beyond drawing boxes on images. For language and code models it usually falls into a few task types:' },
            { type: 'table', head: ['Task', 'What you produce', 'What usually goes wrong'], rows: [
                ['Demonstrations (SFT)', 'An ideal response to a prompt', 'Answers that are correct but not what the guideline asked for'],
                ['Preference ranking', 'Which of two responses is better, and why', 'Preferring the longer or more confident answer'],
                ['Rubric grading', 'A score per criterion', 'Criteria interpreted differently by different people'],
                ['Code evaluation', 'Whether code is correct, safe and idiomatic', 'Judging code by reading it instead of running it'],
            ] },
            { type: 'h2', id: 'guidelines', toc: 'Guidelines are the product', text: 'The guidelines are the product' },
            { type: 'p', text: 'The single biggest lever on data quality is the **guideline document**. A vague instruction like “rate helpfulness” produces noise; a guideline with definitions, worked examples and explicit tie-breakers produces signal. Treat it like an API contract: version it, write down the rationale for each rule, and add an example every time a disagreement comes up.' },
            { type: 'callout', title: 'Keep an edge-case log', text: 'Every time you hesitate on an item, write the item and your decision into a shared log. After a week, the log tells you exactly which rules are missing from the guideline.' },
            { type: 'h2', id: 'agreement', toc: 'Measuring agreement', text: 'Measuring agreement' },
            { type: 'p', text: 'If two careful annotators disagree often, the task is under-specified, not the people. **Cohen’s kappa** measures agreement beyond what chance would produce: `κ = (pₒ − pₑ) / (1 − pₑ)`. Raw percent agreement looks great on imbalanced labels; kappa does not let you fool yourself.' },
            { type: 'code', lang: 'python', code: `from sklearn.metrics import cohen_kappa_score

a = ["safe", "safe", "unsafe", "safe", "unsafe", "safe"]
b = ["safe", "unsafe", "unsafe", "safe", "unsafe", "safe"]

print(cohen_kappa_score(a, b))  # 0.67: decent, but worth a calibration session` },
            { type: 'h2', id: 'quality', toc: 'Quality loops', text: 'Quality loops that work' },
            { type: 'ul', items: [
                '**Golden sets**: a small set of items with agreed answers, mixed blind into the queue to catch drift.',
                '**Calibration sessions**: annotators label the same batch, then discuss every disagreement until the guideline covers it.',
                '**Rationales**: a one-line “why” for each judgement makes reviews faster and exposes shaky reasoning.',
                '**Spot-check the fast ones**: unusually quick completion times are the cheapest quality signal you have.',
            ] },
            { type: 'h2', id: 'code-tasks', toc: 'Evaluating code', text: 'Evaluating code: run it' },
            { type: 'p', text: 'For coding tasks, reading the code is not enough. Plausible-looking code that fails on an empty list or an off-by-one boundary is exactly what models produce and reviewers miss. Running it, writing two or three edge-case tests, and checking complexity against the constraints catches most of what reading misses.' },
            { type: 'quote', text: 'A model can only be as careful as the data that taught it what “careful” means.' },
            { type: 'h2', id: 'takeaways', toc: 'For engineers', text: 'Takeaways for engineers' },
            { type: 'p', text: 'Annotation changed how I think about ML systems: the dataset is a system with its own specs, tests and regressions. Clear contracts, measurable agreement and fast feedback loops are the same engineering habits that keep backend systems healthy.' },
        ],
        resources: [
            { title: 'Training language models to follow instructions (InstructGPT)', kind: 'Paper', category: 'RLHF', url: 'https://arxiv.org/abs/2203.02155', image: img('photo-1677442136019-21780ecad995', 400) },
            { title: 'Cohen’s kappa', kind: 'Article', category: 'Statistics', url: 'https://en.wikipedia.org/wiki/Cohen%27s_kappa', image: img('photo-1551288049-bebda4e38f71', 400) },
            { title: 'Label Studio guide', kind: 'Docs', category: 'Tooling', url: 'https://labelstud.io/guide/', image: img('photo-1504384308090-c894fdcc538d', 400) },
        ],
    },
    {
        id: 'blog-idempotency',
        slug: 'idempotency-in-payment-systems',
        title: 'Idempotency in Payment Systems: Retries Without Double Charges',
        excerpt: 'Timeouts are ambiguous, so retries are inevitable. Idempotency keys, deduplicating consumers and the outbox pattern make them safe.',
        content: '',
        image: img('photo-1563013544-824ae1b704d3'),
        date: '2026-09-06',
        category: 'system-design',
        tags: ['System Design', 'Payments', 'Kafka', 'Microservices', 'Java'],
        author,
        readTime: '7',
        body: [
            { type: 'h2', id: 'ambiguity', toc: 'Timeouts are ambiguous', text: 'Timeouts are ambiguous' },
            { type: 'p', text: 'When a payment request times out, the client cannot tell whether the debit happened. The request may have failed, succeeded with a lost response, or still be running. The only safe client behaviour is to **retry**, so the server must make retries harmless.' },
            { type: 'h2', id: 'keys', toc: 'Idempotency keys', text: 'Idempotency keys' },
            { type: 'p', text: 'The client generates a unique key per logical operation and sends it with every attempt. The server stores the key with a hash of the request and, once finished, the response. A repeat with the same key replays the stored response instead of executing again.' },
            { type: 'code', lang: 'java', code: `public PaymentResponse pay(String key, PaymentRequest req) {
    String hash = Hashing.sha256(req);

    Optional<IdempotencyRecord> existing = store.find(key);
    if (existing.isPresent()) {
        IdempotencyRecord rec = existing.get();
        if (!rec.requestHash().equals(hash)) throw new IdempotencyConflict(key); // same key, different body
        if (rec.inProgress()) throw new RequestInProgress(key);                  // client should back off
        return rec.response();                                                    // replay, don't re-execute
    }

    if (!store.claim(key, hash, Duration.ofSeconds(30))) throw new RequestInProgress(key);
    PaymentResponse response = ledger.debit(req);
    store.complete(key, response);
    return response;
}` },
            { type: 'ul', items: [
                '**Reject key reuse with a different payload.** Otherwise a client bug silently returns the wrong payment.',
                '**Claim atomically** (a conditional insert), so two concurrent retries cannot both execute.',
                '**Expire keys** after the client’s maximum retry window, typically 24 hours.',
            ] },
            { type: 'h2', id: 'exactly-once', toc: 'The exactly-once myth', text: 'The exactly-once myth' },
            { type: 'p', text: 'Kafka’s exactly-once semantics cover read-process-write **within Kafka**. The moment a consumer touches a database or calls another service, delivery is at-least-once again. The fix is an **idempotent consumer**: record each processed event id in the same transaction as its side effect.' },
            { type: 'code', lang: 'sql', code: `BEGIN;
INSERT INTO processed_events (event_id) VALUES (:eventId); -- PK violation = already done
UPDATE wallets SET balance = balance + :amount WHERE id = :walletId;
COMMIT;` },
            { type: 'h2', id: 'outbox', toc: 'Transactional outbox', text: 'The transactional outbox' },
            { type: 'p', text: 'The mirror-image problem is publishing: “update the database, then send to Kafka” loses events if the process dies between the two steps. With an **outbox**, the state change and the event are written in one local transaction, and a relay (a poller or CDC with Debezium) publishes outbox rows afterwards. Consumers dedupe by event id, so the relay is free to retry too.' },
            { type: 'code', lang: 'sql', code: `BEGIN;
UPDATE accounts SET balance = balance - 500 WHERE id = 'A1';
INSERT INTO outbox (event_id, topic, payload)
VALUES (gen_random_uuid(), 'payments.debited', '{"account":"A1","amount":500}');
COMMIT;` },
            { type: 'h2', id: 'checklist', toc: 'Checklist', text: 'Checklist' },
            { type: 'ol', items: [
                'Every mutating API accepts an idempotency key.',
                'Retries use exponential backoff with jitter and a bounded total time.',
                'Every consumer can process the same event twice without a visible effect.',
                'State changes and their events are committed together (outbox), never in two steps.',
                'Reconciliation jobs compare ledgers end to end, because something will still slip through.',
            ] },
        ],
        resources: [
            { title: 'Designing robust APIs with idempotency', kind: 'Article', category: 'Stripe', url: 'https://stripe.com/blog/idempotency', image: img('photo-1563013544-824ae1b704d3', 400) },
            { title: 'Pattern: Transactional outbox', kind: 'Pattern', category: 'Microservices', url: 'https://microservices.io/patterns/data/transactional-outbox.html', image: img('photo-1451187580459-43490279c0fa', 400) },
            { title: 'Apache Kafka documentation', kind: 'Docs', category: 'Streaming', url: 'https://kafka.apache.org/documentation/', image: img('photo-1558494949-ef010cbdcc31', 400) },
        ],
    },
    {
        id: 'blog-cassandra-yugabyte',
        slug: 'cassandra-vs-yugabytedb',
        title: 'Cassandra vs YugabyteDB: Choosing for the Workload, Not the Hype',
        excerpt: 'Leaderless wide-column storage or Raft-backed distributed SQL? A practical guide to which workloads fit which database.',
        content: '',
        image: img('photo-1544383835-bda2bc66a55d'),
        date: '2026-08-16',
        category: 'system-design',
        tags: ['System Design', 'Cassandra', 'YugabyteDB', 'Databases', 'Distributed Systems'],
        author,
        readTime: '6',
        body: [
            { type: 'h2', id: 'two-models', toc: 'Two models', text: 'Two very different models' },
            { type: 'p', text: '**Apache Cassandra** is leaderless: any replica accepts writes, consistency is tunable per query, and data is modelled around the queries you will run. **YugabyteDB** is distributed SQL: data is split into tablets, each replicated with Raft, and you get PostgreSQL-compatible SQL (YSQL) with distributed ACID transactions. It also offers a Cassandra-compatible API (YCQL).' },
            { type: 'table', head: ['', 'Cassandra', 'YugabyteDB'], rows: [
                ['Replication', 'Leaderless, tunable consistency', 'Raft per tablet, strongly consistent'],
                ['Transactions', 'Single-partition; LWT for compare-and-set', 'Multi-row, multi-table ACID'],
                ['Query model', 'Query-first tables, no joins', 'SQL with joins, secondary indexes, constraints'],
                ['Write path', 'Very cheap, no coordination', 'Consensus round trip per write'],
                ['Sweet spot', 'High-volume, append-heavy data', 'Correctness-critical relational data'],
            ] },
            { type: 'h2', id: 'cassandra', toc: 'When Cassandra', text: 'When I reach for Cassandra' },
            { type: 'ul', items: [
                'Time-series and event data: velocity features, audit trails, activity feeds.',
                'Write-heavy workloads where availability matters more than cross-row consistency.',
                'Access patterns you know up front and can model as one partition per query.',
            ] },
            { type: 'p', text: 'Watch partition sizes (keep them bounded with time buckets), avoid patterns that create piles of tombstones, and remember that lightweight transactions cost several round trips. They are for rare compare-and-set operations, not every write.' },
            { type: 'h2', id: 'yugabyte', toc: 'When YugabyteDB', text: 'When I reach for YugabyteDB' },
            { type: 'ul', items: [
                'Ledgers and balances, where invariants span multiple rows.',
                'Uniqueness constraints and foreign keys you don’t want to enforce in application code.',
                'Teams that know PostgreSQL and need horizontal scale without rewriting queries.',
            ] },
            { type: 'p', text: 'Every write pays for consensus, and cross-region clusters pay for distance. Prefer hash sharding for keys that grow monotonically (timestamps, sequences) to avoid a single hot tablet, and keep transactions small.' },
            { type: 'callout', title: 'It is rarely either/or', text: 'A common split: YugabyteDB holds the source of truth (accounts, ledger), while Cassandra holds derived, high-volume data fed by Kafka (features, history). Each database does what it is good at.' },
            { type: 'h2', id: 'decide', toc: 'Deciding', text: 'A quick way to decide' },
            { type: 'ol', items: [
                'Write down the five most frequent queries and the invariants that must never break.',
                'If an invariant spans rows, start from YugabyteDB.',
                'If every query is a single-partition lookup or range scan at high volume, start from Cassandra.',
                'Load test with production-shaped data before you commit; tail latency under compaction or leader moves is what bites.',
            ] },
        ],
        resources: [
            { title: 'Apache Cassandra documentation', kind: 'Docs', category: 'Database', url: 'https://cassandra.apache.org/doc/latest/', image: img('photo-1544383835-bda2bc66a55d', 400) },
            { title: 'YugabyteDB documentation', kind: 'Docs', category: 'Database', url: 'https://docs.yugabyte.com/', image: img('photo-1558494949-ef010cbdcc31', 400) },
            { title: 'Jepsen analyses', kind: 'Research', category: 'Correctness', url: 'https://jepsen.io/analyses', image: img('photo-1451187580459-43490279c0fa', 400) },
        ],
    },
];
