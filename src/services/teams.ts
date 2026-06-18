import {
    addDoc,
    collection,
    doc,
    updateDoc,
    deleteDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    where,
    getDoc,
    onSnapshot
} from 'firebase/firestore'

import {db} from '../lib/firebase'
import type { CreateTeamInput,Team, TeamComment } from '../types/team'

const teamsCollection = collection(db,'teams')

export async function createTeam(input : CreateTeamInput){
    const docRef = await addDoc(teamsCollection,{
        name : input.name,
        ownerId : input.ownerId,
        authorName: input.authorName,
        game: input.game,
        pokemons : input.pokemons,
        isPublic: false,
        likes: [],
        comments: [],
        createdAt : serverTimestamp(),
        updatedAt : serverTimestamp(),
    })
    return docRef.id
}

export async function getTeamsByOwner(ownerId:string): Promise<Team[]> {
    const q = query(
        teamsCollection,
        where('ownerId','==',ownerId),
        orderBy('createdAt','desc')
    )

    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc)=>{
        const data = doc.data()
        return {
            id : doc.id,
            name : data.name,
            ownerId : data.ownerId,
            authorName: data.authorName,
            game: data.game ?? 'red-blue', // fallback per vecchi team senza gioco
            pokemons : data.pokemons ?? [],
            createdAt : data.createdAt?.toDate?.().toISOString?.() ?? '',
            updatedAt : data.updatedAt?.toDate?.().toISOString?.() ?? '',
            isPublic: data.isPublic ?? false,
            description: data.description,
            likes: data.likes ?? [],
            comments: data.comments ?? [],
        }
    })
}

// Aggiungi questa funzione in fondo a src/services/teams.ts
export async function checkTeamName(ownerId: string, name: string, excludeTeamId?: string): Promise<boolean> {
    const q = query(
        teamsCollection,
        where('ownerId', '==', ownerId),
        where('name', '==', name)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return false
    
    if (excludeTeamId) {
        // Se stiamo modificando, verifichiamo che l'unico team con questo nome sia quello attuale
        return snapshot.docs.some(doc => doc.id !== excludeTeamId)
    }
    return true 
}

export async function updateTeam(teamId: string, input: Partial<CreateTeamInput>) {
    const teamRef = doc(db, 'teams', teamId)
    await updateDoc(teamRef, {
        ...input,
        updatedAt: serverTimestamp()
    })
}

export async function deleteTeam(teamId: string) {
    const teamRef = doc(db, 'teams', teamId)
    await deleteDoc(teamRef)
}

export async function publishTeam(teamId : string, description: string) {
    const teamRef = doc(db,'teams',teamId)
    await updateDoc(teamRef,{isPublic: true,description: description})
}

export async function unpublishTeam(teamId : string) {
    const teamRef = doc(db,'teams',teamId)
    await updateDoc(teamRef,{isPublic: false})
}

export async function getAllPublicTeams(): Promise<Team[]>{
    const q = query(
        teamsCollection,
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q) 

    return snapshot.docs.map((doc)=>{
        const data = doc.data()
        return {
            id : doc.id,
            name : data.name,
            ownerId : data.ownerId,
            authorName: data.authorName,
            game: data.game, // fallback per vecchi team senza gioco
            pokemons : data.pokemons ?? [],
            createdAt : data.createdAt?.toDate?.().toISOString?.() ?? '',
            updatedAt : data.updatedAt?.toDate?.().toISOString?.() ?? '',
            isPublic: data.isPublic ?? false,
            description: data.description,
            likes: data.likes ?? [],
            comments: data.comments ?? [],
        }
    })
}

// Funzione per iscriversi agli aggiornamenti in tempo reale dei team pubblici
export function subscribeToPublicTeams(callback: (teams: Team[]) => void, onError?: (error: Error) => void) {
    const q = query(
        teamsCollection,
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
    )

    return onSnapshot(q, (snapshot) => {
        const teams = snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
                id: doc.id,
                name: data.name,
                ownerId: data.ownerId,
                authorName: data.authorName,
                game: data.game, // fallback per vecchi team senza gioco
                pokemons: data.pokemons ?? [],
                createdAt: data.createdAt?.toDate?.().toISOString?.() ?? '',
                updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? '',
                isPublic: data.isPublic ?? false,
                description: data.description,
                likes: data.likes ?? [],
                comments: data.comments ?? [],
            } as Team
        })
        callback(teams)
    }, (error) => {
        if (onError) onError(error)
    })
}

export async function toggleLike(teamId:string,userId:string) {
    const teamRef= doc(db,'teams',teamId)
    const snapshot = await getDoc(teamRef)

    if (!snapshot.exists()) {
        throw new Error("Team non trovato")
    }

    const data = snapshot.data()
    const currentLikes: string[] = data.likes || []

    // Controlliamo se l'ID dell'utente è già nell'array
    if (currentLikes.includes(userId)) {
        // C'è già: lo rimuoviamo
        await updateDoc(teamRef, { likes: currentLikes.filter(id => id !== userId) })
    } else {
        // Non c'è: lo aggiungiamo
        await updateDoc(teamRef, { likes: [...currentLikes, userId] })
    }
}

export async function addComment(teamId:string,userId:string,userName:string,text:string, replyToId?: string) {
    const teamRef = doc(db, 'teams',teamId)
    const snapshot = await getDoc(teamRef)

    if(!snapshot.exists()){
        throw new Error('team non trovato')
    }
    // Facciamo il fallback su un array vuoto se i commenti non esistono ancora
    const currentComments = snapshot.data().comments || []

    const newComment : TeamComment = {
        id : Date.now().toString(), // Usiamo il timestamp esatto come ID univoco (veloce e semplice)
        userId : userId,
        userName: userName,
        text: text,
        createdAt: new Date().toISOString() // Formato standard leggibile e ordinabile
    }

    if (replyToId) {
        newComment.replyToId = replyToId
    }

    await updateDoc(teamRef,{comments: [...currentComments,newComment]})

    return newComment
}

export async function removeComment(teamId: string, commentId: string) {
    const teamRef = doc(db, 'teams', teamId)
    const snapshot = await getDoc(teamRef)

    if(!snapshot.exists()){
        throw new Error('team non trovato')
    }

    const currentComments: TeamComment[] = snapshot.data().comments || []
    // Rimuoviamo il commento e tutte le eventuali risposte collegate ad esso
    const updatedComments = currentComments.filter(c => c.id !== commentId && c.replyToId !== commentId)

    await updateDoc(teamRef, { comments: updatedComments })
}
