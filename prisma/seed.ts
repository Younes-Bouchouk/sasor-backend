import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await hash('Azerty78', 10);

    // ───── Nettoyage ─────
    await prisma.eventInvitation.deleteMany();
    await prisma.eventMessage.deleteMany();
    await prisma.eventParticipant.deleteMany();
    await prisma.userSubscription.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.event.deleteMany();
    await prisma.sport.deleteMany();
    await prisma.user.deleteMany();

    // ───── Users ─────
    const [alice, bob, charlie, diana, ethan] = await Promise.all([
        prisma.user.create({
            data: {
                email: 'alice@sasor.fr',
                pseudo: 'alice',
                sexe: 'F',
                password: hashedPassword,
                biography: 'Passionnée de foot et de natation.',
                birthday: new Date('1998-04-12'),
            },
        }),
        prisma.user.create({
            data: {
                email: 'bob@sasor.fr',
                pseudo: 'bob',
                sexe: 'M',
                password: hashedPassword,
                biography: 'Basketteur du dimanche.',
                birthday: new Date('1995-09-23'),
            },
        }),
        prisma.user.create({
            data: {
                email: 'charlie@sasor.fr',
                pseudo: 'charlie',
                sexe: 'M',
                password: hashedPassword,
                biography: 'Fan de tennis et de randonnée.',
                birthday: new Date('2000-01-07'),
            },
        }),
        prisma.user.create({
            data: {
                email: 'diana@sasor.fr',
                pseudo: 'diana',
                sexe: 'F',
                password: hashedPassword,
                biography: 'Coureuse de fond, marathons tous les ans.',
                birthday: new Date('1997-06-30'),
            },
        }),
        prisma.user.create({
            data: {
                email: 'ethan@sasor.fr',
                pseudo: 'ethan',
                sexe: 'M',
                password: hashedPassword,
                birthday: new Date('2001-11-15'),
            },
        }),
    ]);

    // ───── Sports ─────
    const [foot, basket, tennis, natation, running] = await Promise.all([
        prisma.sport.create({
            data: {
                name: 'Football',
                isHighlighted: true,
                startHighlight: new Date('2026-04-01'),
                endHighlight: new Date('2026-05-01'),
            },
        }),
        prisma.sport.create({ data: { name: 'Basketball', isHighlighted: true, startHighlight: new Date('2026-04-01'), endHighlight: new Date('2026-04-30') } }),
        prisma.sport.create({ data: { name: 'Tennis' } }),
        prisma.sport.create({ data: { name: 'Natation' } }),
        prisma.sport.create({ data: { name: 'Running', isHighlighted: false } }),
    ]);

    // ───── Events ─────
    const [event1, event2, event3, event4] = await Promise.all([
        prisma.event.create({
            data: {
                userId: alice.id,
                sportId: foot.id,
                name: 'Match de foot du samedi',
                description: 'Venez nombreux, tous niveaux acceptés !',
                location: 'Stade Municipal, Paris',
                maxParticipants: 22,
                isPrivate: false,
                startAt: new Date('2026-05-10T10:00:00Z'),
            },
        }),
        prisma.event.create({
            data: {
                userId: bob.id,
                sportId: basket.id,
                name: '3x3 Basket Open',
                description: 'Tournoi de basket 3 contre 3.',
                location: 'Gymnase Colette, Lyon',
                maxParticipants: 12,
                isPrivate: false,
                startAt: new Date('2026-05-15T14:00:00Z'),
            },
        }),
        prisma.event.create({
            data: {
                userId: diana.id,
                sportId: running.id,
                name: 'Run du dimanche',
                description: 'Sortie running 10 km, allure modérée.',
                location: 'Parc de la Tête d\'Or, Lyon',
                maxParticipants: 20,
                isPrivate: false,
                startAt: new Date('2026-05-18T08:00:00Z'),
            },
        }),
        prisma.event.create({
            data: {
                userId: charlie.id,
                sportId: tennis.id,
                name: 'Tournoi tennis privé',
                description: 'Tournoi entre amis, sur invitation.',
                location: 'Club Tennis des Pins, Bordeaux',
                maxParticipants: 8,
                isPrivate: true,
                startAt: new Date('2026-05-20T09:00:00Z'),
            },
        }),
    ]);

    // ───── EventParticipants ─────
    await Promise.all([
        // alice organise event1 → elle est participante
        prisma.eventParticipant.create({ data: { userId: alice.id, eventId: event1.id, canInvite: true } }),
        prisma.eventParticipant.create({ data: { userId: bob.id, eventId: event1.id } }),
        prisma.eventParticipant.create({ data: { userId: charlie.id, eventId: event1.id } }),

        // bob organise event2
        prisma.eventParticipant.create({ data: { userId: bob.id, eventId: event2.id, canInvite: true } }),
        prisma.eventParticipant.create({ data: { userId: ethan.id, eventId: event2.id } }),

        // diana organise event3
        prisma.eventParticipant.create({ data: { userId: diana.id, eventId: event3.id, canInvite: true } }),
        prisma.eventParticipant.create({ data: { userId: alice.id, eventId: event3.id } }),

        // charlie organise event4
        prisma.eventParticipant.create({ data: { userId: charlie.id, eventId: event4.id, canInvite: true } }),
    ]);

    // ───── Follows ─────
    await Promise.all([
        prisma.follow.create({ data: { followerId: alice.id, followingId: bob.id } }),
        prisma.follow.create({ data: { followerId: alice.id, followingId: diana.id } }),
        prisma.follow.create({ data: { followerId: bob.id, followingId: alice.id } }),
        prisma.follow.create({ data: { followerId: charlie.id, followingId: alice.id } }),
        prisma.follow.create({ data: { followerId: diana.id, followingId: charlie.id } }),
        prisma.follow.create({ data: { followerId: ethan.id, followingId: bob.id } }),
    ]);

    // ───── EventMessages ─────
    await Promise.all([
        prisma.eventMessage.create({ data: { userId: alice.id, eventId: event1.id, message: 'Hâte d\'être au match !' } }),
        prisma.eventMessage.create({ data: { userId: bob.id, eventId: event1.id, message: 'Je serai là, j\'amène des plots.' } }),
        prisma.eventMessage.create({ data: { userId: charlie.id, eventId: event1.id, message: 'On se retrouve à quelle heure ?' } }),
        prisma.eventMessage.create({ data: { userId: bob.id, eventId: event2.id, message: 'Inscriptions ouvertes jusqu\'à vendredi !' } }),
        prisma.eventMessage.create({ data: { userId: ethan.id, eventId: event2.id, message: 'Je suis chaud, on va tout déchirer.' } }),
        prisma.eventMessage.create({ data: { userId: diana.id, eventId: event3.id, message: 'Allure 6 min/km, personne ne sera largué.' } }),
    ]);

    // ───── EventInvitations ─────
    await Promise.all([
        // charlie invite ethan sur event4 (privé)
        prisma.eventInvitation.create({
            data: {
                eventId: event4.id,
                invitedById: charlie.id,
                userId: ethan.id,
                status: 'PENDING',
            },
        }),
        // alice invite diana sur event1
        prisma.eventInvitation.create({
            data: {
                eventId: event1.id,
                invitedById: alice.id,
                userId: diana.id,
                status: 'ACCEPTED',
                respondedAt: new Date(),
            },
        }),
    ]);

    // ───── UserSubscriptions ─────
    await Promise.all([
        prisma.userSubscription.create({
            data: {
                userId: alice.id,
                type: 'PREMIUM',
                startAt: new Date('2026-01-01'),
                endAt: new Date('2027-01-01'),
            },
        }),
        prisma.userSubscription.create({
            data: {
                userId: bob.id,
                type: 'BASIC',
                startAt: new Date('2026-03-01'),
                endAt: new Date('2026-09-01'),
            },
        }),
    ]);

    console.log('Seed terminé avec succès.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
