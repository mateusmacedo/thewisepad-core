import { NoteData, NoteRepository } from '@/use-cases/ports'

export class InMemoryNoteRepository implements NoteRepository {
  private readonly _data: NoteData[]
  private idcounder: number = 0
  private get data () {
    return this._data
  }

  constructor (data: NoteData[]) {
    this._data = data
  }

  public async add (note: NoteData): Promise<NoteData> {
    note.id = this.idcounder.toString()
    this.idcounder++
    this._data.push(note)
    return note
  }

  public async findAllNotesFrom (userId: string): Promise<NoteData[]> {
    return this.data.filter(note => note.ownerId === userId)
  }

  public async findById (noteId: string): Promise<NoteData> {
    const note = this.data.find(note => note.id === noteId)
    return note || null
  }

  public async remove (noteId: string): Promise<NoteData> {
    const noteToBeRemoved = this.data.find(note => note.id === noteId)
    if (!noteToBeRemoved) {
      return null
    }
    this.data.splice(this.data.findIndex(note => note.id === noteId), 1)
    return noteToBeRemoved
  }

  public async updateTitle (noteId: string, newTitle: string): Promise<boolean> {
    const originalNote = await this.findById(noteId)
    if (!originalNote) {
      return false
    }
    originalNote.title = newTitle
    return true
  }

  public async updateContent (noteId: string, newContent: string): Promise<boolean> {
    const originalNote = await this.findById(noteId)
    if (!originalNote) {
      return false
    }
    originalNote.content = newContent
    return true
  }
}